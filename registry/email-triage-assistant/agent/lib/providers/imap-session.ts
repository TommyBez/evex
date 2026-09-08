import { connect as tlsConnect, type TLSSocket } from "node:tls";

import { assertDraftsOnlyImap } from "../send-guard";

export type ImapTransport = {
  write(chunk: string): Promise<void>;
  readUntil(predicate: (buffer: string) => boolean): Promise<string>;
  close(): Promise<void>;
};

export type ImapConnectOptions = {
  readonly host: string;
  readonly port: number;
  readonly timeoutMs?: number;
};

export type ImapConnect = (options: ImapConnectOptions) => Promise<ImapTransport>;

export function createTlsImapConnect(): ImapConnect {
  return async ({ host, port, timeoutMs = 20_000 }) => {
    assertDraftsOnlyImap(host, port);
    const socket = await new Promise<TLSSocket>((resolve, reject) => {
      const connection = tlsConnect({ host, port, servername: host }, () => {
        resolve(connection);
      });
      connection.setTimeout(timeoutMs);
      connection.once("error", reject);
      connection.once("timeout", () => {
        reject(new Error(`IMAP TLS timeout connecting to ${host}:${port}`));
      });
    });

    let buffer = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk: string) => {
      buffer += chunk;
    });

    return {
      async write(chunk) {
        await new Promise<void>((resolve, reject) => {
          socket.write(chunk, (error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });
      },
      async readUntil(predicate) {
        const started = Date.now();
        while (!predicate(buffer)) {
          if (Date.now() - started > timeoutMs) {
            throw new Error("IMAP read timed out.");
          }
          await new Promise((resolve) => {
            setTimeout(resolve, 10);
          });
        }
        const snapshot = buffer;
        buffer = "";
        return snapshot;
      },
      async close() {
        socket.end();
      },
    };
  };
}

export class ImapClient {
  private tag = 0;

  constructor(private readonly transport: ImapTransport) {}

  async connectGreeting(): Promise<void> {
    await this.transport.readUntil((buffer) => /\* OK /i.test(buffer));
  }

  async login(user: string, password: string): Promise<void> {
    await this.command(`LOGIN ${quote(user)} ${quote(password)}`);
  }

  async select(mailbox: string): Promise<void> {
    await this.command(`SELECT ${quote(mailbox)}`);
  }

  async searchAll(): Promise<readonly number[]> {
    const raw = await this.command("UID SEARCH ALL");
    const match = /\* SEARCH([\d\s]*)/i.exec(raw);
    if (!match?.[1]) {
      return [];
    }
    return match[1]
      .trim()
      .split(/\s+/)
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => Number.isInteger(item) && item > 0);
  }

  async fetchRfc822(uid: number): Promise<string> {
    const raw = await this.command(`UID FETCH ${uid} (RFC822)`);
    const literal = /\{(\d+)\}\r?\n([\s\S]*)$/i.exec(raw);
    if (literal?.[2]) {
      return literal[2].replace(/\r?\n(?:A\d+ OK|\)).*$/is, "").trimEnd();
    }
    return raw;
  }

  async appendDraft(mailbox: string, rfc822: string): Promise<string> {
    this.tag += 1;
    const tag = `A${this.tag}`;
    await this.transport.write(
      `${tag} APPEND ${quote(mailbox)} (\\Draft) {${Buffer.byteLength(rfc822, "utf8")}}\r\n`,
    );
    await this.transport.readUntil((buffer) => /\+\s/.test(buffer));
    await this.transport.write(`${rfc822}\r\n`);
    const result = await this.transport.readUntil((buffer) =>
      new RegExp(`^${tag} (OK|NO|BAD)`, "im").test(buffer),
    );
    if (!new RegExp(`^${tag} OK`, "im").test(result)) {
      throw new Error(`IMAP APPEND to ${mailbox} failed.`);
    }
    const uid = /APPENDUID \d+ (\d+)/i.exec(result)?.[1];
    return uid ?? `${Date.now()}`;
  }

  async copy(uid: number, mailbox: string): Promise<void> {
    await this.command(`UID COPY ${uid} ${quote(mailbox)}`);
  }

  async storeKeyword(uid: number, keyword: string): Promise<void> {
    await this.command(`UID STORE ${uid} +FLAGS (${keyword})`);
  }

  async logout(): Promise<void> {
    try {
      await this.command("LOGOUT");
    } finally {
      await this.transport.close();
    }
  }

  private async command(line: string): Promise<string> {
    this.tag += 1;
    const tag = `A${this.tag}`;
    await this.transport.write(`${tag} ${line}\r\n`);
    const result = await this.transport.readUntil((buffer) =>
      new RegExp(`^${tag} (OK|NO|BAD)`, "im").test(buffer),
    );
    if (!new RegExp(`^${tag} OK`, "im").test(result)) {
      throw new Error(`IMAP command failed: ${line}`);
    }
    return result;
  }
}

function quote(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}
