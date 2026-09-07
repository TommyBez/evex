import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PageSnapshot = {
  readonly url: string;
  readonly hash: string;
  readonly text: string;
  readonly fetchedAt: string;
};

export type SnapshotStore = {
  get(url: string): Promise<PageSnapshot | null>;
  set(snapshot: PageSnapshot): Promise<void>;
  list(): Promise<readonly PageSnapshot[]>;
};

type StoreDocument = {
  readonly snapshots: Record<string, PageSnapshot>;
};

const REDIS_KEY = "competitor-intel-monitor:snapshots";

const emptyDocument = (): StoreDocument => ({ snapshots: {} });

export class MemorySnapshotStore implements SnapshotStore {
  readonly #snapshots = new Map<string, PageSnapshot>();

  async get(url: string): Promise<PageSnapshot | null> {
    return this.#snapshots.get(url) ?? null;
  }

  async set(snapshot: PageSnapshot): Promise<void> {
    this.#snapshots.set(snapshot.url, snapshot);
  }

  async list(): Promise<readonly PageSnapshot[]> {
    return [...this.#snapshots.values()];
  }
}

export class FileSnapshotStore implements SnapshotStore {
  constructor(private readonly filePath: string) {}

  async get(url: string): Promise<PageSnapshot | null> {
    const document = await this.#read();
    return document.snapshots[url] ?? null;
  }

  async set(snapshot: PageSnapshot): Promise<void> {
    const document = await this.#read();
    const next: StoreDocument = {
      snapshots: { ...document.snapshots, [snapshot.url]: snapshot },
    };
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  }

  async list(): Promise<readonly PageSnapshot[]> {
    return Object.values((await this.#read()).snapshots);
  }

  async #read(): Promise<StoreDocument> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as StoreDocument;
      if (!parsed || typeof parsed !== "object" || !parsed.snapshots) {
        return emptyDocument();
      }
      return parsed;
    } catch {
      return emptyDocument();
    }
  }
}

type RedisFetch = typeof fetch;

export class RedisSnapshotStore implements SnapshotStore {
  constructor(
    private readonly restUrl: string,
    private readonly token: string,
    private readonly fetchImpl: RedisFetch = fetch,
  ) {}

  async get(url: string): Promise<PageSnapshot | null> {
    const document = await this.#read();
    return document.snapshots[url] ?? null;
  }

  async set(snapshot: PageSnapshot): Promise<void> {
    const document = await this.#read();
    const next: StoreDocument = {
      snapshots: { ...document.snapshots, [snapshot.url]: snapshot },
    };
    const response = await this.fetchImpl(
      `${this.restUrl.replace(/\/+$/, "")}/set/${encodeURIComponent(REDIS_KEY)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(next),
      },
    );
    if (!response.ok) {
      throw new Error(`Redis snapshot write failed with HTTP ${response.status}.`);
    }
  }

  async list(): Promise<readonly PageSnapshot[]> {
    return Object.values((await this.#read()).snapshots);
  }

  async #read(): Promise<StoreDocument> {
    const response = await this.fetchImpl(
      `${this.restUrl.replace(/\/+$/, "")}/get/${encodeURIComponent(REDIS_KEY)}`,
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    if (response.status === 404) {
      return emptyDocument();
    }
    if (!response.ok) {
      throw new Error(`Redis snapshot read failed with HTTP ${response.status}.`);
    }
    const payload = (await response.json()) as { result?: string | StoreDocument | null };
    if (!payload.result) {
      return emptyDocument();
    }
    if (typeof payload.result === "string") {
      try {
        return JSON.parse(payload.result) as StoreDocument;
      } catch {
        return emptyDocument();
      }
    }
    return payload.result.snapshots ? payload.result : emptyDocument();
  }
}

export const createSnapshotStore = (
  env: NodeJS.ProcessEnv = process.env,
  storePath = env.COMPETITOR_INTEL_STORE_PATH ?? ".data/competitor-intel-store.json",
): SnapshotStore => {
  const restUrl = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (restUrl && token) {
    return new RedisSnapshotStore(restUrl, token);
  }
  return new FileSnapshotStore(storePath);
};

export const storeKind = (
  env: NodeJS.ProcessEnv = process.env,
): "redis" | "file" =>
  env.UPSTASH_REDIS_REST_URL?.trim() && env.UPSTASH_REDIS_REST_TOKEN?.trim()
    ? "redis"
    : "file";
