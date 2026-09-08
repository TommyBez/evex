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

export type ImapFetchedMessage = {
  readonly rfc822: string;
  readonly flags: readonly string[];
};

export function createTlsImapConnect(): ImapConnect {
  return async ({ host, port, timeoutMs = 20_000 }) => {
    assertDraftsOnlyImap(host, port);
    const socket = await new Promise<TLSSocket>((resolve, reject) => {
      let settled = false;
      const connection = tlsConnect({ host, port, servername: host }, () => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(connection);
      });
      connection.setTimeout(timeoutMs);
      const fail = (error: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        reject(error);
      };
      connection.once("error", fail);
      connection.once("timeout", () => {
        connection.destroy();
        fail(new Error(`IMAP TLS timeout connecting to ${host}:${port}`));
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
    const fetched = await this.fetchRfc822AndFlags(uid);
    return fetched.rfc822;
  }

  async fetchRfc822AndFlags(uid: number): Promise<ImapFetchedMessage> {
    const raw = await this.command(`UID FETCH ${uid} (FLAGS RFC822)`);
    return {
      rfc822: extractRfc822Literal(raw),
      flags: extractFlags(raw),
    };
  }

  async ensureMailbox(mailbox: string): Promise<void> {
    for (const ancestor of mailboxAncestors(mailbox)) {
      await this.createMailbox(ancestor);
    }
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

  private async createMailbox(mailbox: string): Promise<void> {
    this.tag += 1;
    const tag = `A${this.tag}`;
    await this.transport.write(`${tag} CREATE ${quote(mailbox)}\r\n`);
    const result = await this.transport.readUntil((buffer) =>
      new RegExp(`^${tag} (OK|NO|BAD)`, "im").test(buffer),
    );
    if (new RegExp(`^${tag} OK`, "im").test(result)) {
      return;
    }
    if (/ALREADYEXISTS/i.test(result) || new RegExp(`^${tag} NO`, "im").test(result)) {
      return;
    }
    throw new Error(`IMAP CREATE ${mailbox} failed.`);
  }

  private async command(line: string): Promise<string> {
    this.tag += 1;
    const tag = `A${this.tag}`;
    await this.transport.write(`${tag} ${line}\r\n`);
    const result = await this.transport.readUntil((buffer) =>
      new RegExp(`^${tag} (OK|NO|BAD)`, "im").test(buffer),
    );
    if (!new RegExp(`^${tag} OK`, "im").test(result)) {
      if (line.startsWith("LOGIN ")) {
        throw new Error("IMAP login failed");
      }
      throw new Error(`IMAP command failed: ${line}`);
    }
    return result;
  }
}

export function extractRfc822Literal(raw: string): string {
  const header = /\{(\d+)\}\r?\n/.exec(raw);
  if (!header?.[1]) {
    return raw;
  }
  const declared = Number.parseInt(header[1], 10);
  if (!Number.isInteger(declared) || declared < 0) {
    return raw;
  }
  const start = header.index + header[0].length;
  const bytes = Buffer.from(raw.slice(start), "utf8");
  return bytes.subarray(0, declared).toString("utf8");
}

export function extractFlags(raw: string): readonly string[] {
  const match = /FLAGS\s*\(([^)]*)\)/i.exec(raw);
  if (!match?.[1]) {
    return [];
  }
  return match[1]
    .trim()
    .split(/\s+/)
    .map((flag) => flag.trim())
    .filter(Boolean);
}

function mailboxAncestors(mailbox: string): string[] {
  const parts = mailbox.split("/").filter(Boolean);
  const names: string[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    names.push(parts.slice(0, index + 1).join("/"));
  }
  return names;
}

function quote(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}
