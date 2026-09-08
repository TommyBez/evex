import { mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { diffNormalizedText, hashNormalizedText } from "./page-diff.js";
import { toScoredChange, type ScoredChange } from "./thresholds.js";
import type { AlertThresholds } from "./watch-config.js";

export type SnapshotPayload = {
  readonly hash: string;
  readonly text: string;
  readonly fetchedAt: string;
};

export type PageSnapshot = SnapshotPayload & {
  readonly url: string;
  readonly pending?: SnapshotPayload;
};

export type DeliveryState = {
  readonly slackSent: boolean;
  readonly emailMessageId?: string;
};

export type SnapshotStore = {
  get(url: string): Promise<PageSnapshot | null>;
  set(snapshot: PageSnapshot): Promise<void>;
  commitPending(url: string): Promise<PageSnapshot | null>;
  list(): Promise<readonly PageSnapshot[]>;
  getDelivery(idempotencyKey: string): Promise<DeliveryState | null>;
  setDelivery(idempotencyKey: string, state: DeliveryState): Promise<void>;
};

type StoreDocument = {
  readonly snapshots: Record<string, PageSnapshot>;
  readonly deliveries: Record<string, DeliveryState>;
};

const REDIS_INDEX_KEY = "competitor-intel-monitor:snapshot-urls";
const REDIS_SNAPSHOT_PREFIX = "competitor-intel-monitor:snapshot:";
const REDIS_DELIVERY_PREFIX = "competitor-intel-monitor:delivery:";
const LOCK_RETRIES = 50;
const LOCK_WAIT_MS = 20;

const emptyDocument = (): StoreDocument => ({ snapshots: {}, deliveries: {} });

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const withFileLock = async <T>(lockPath: string, work: () => Promise<T>): Promise<T> => {
  await mkdir(path.dirname(lockPath), { recursive: true });
  for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
    try {
      const handle = await open(lockPath, "wx");
      try {
        await handle.writeFile(`${process.pid}\n`);
        return await work();
      } finally {
        await handle.close();
        await unlink(lockPath).catch(() => undefined);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
      await sleep(LOCK_WAIT_MS);
    }
  }
  throw new Error("Timed out waiting for the snapshot store lock.");
};

const promotePending = (snapshot: PageSnapshot): PageSnapshot => {
  if (!snapshot.pending) {
    return snapshot;
  }
  return {
    url: snapshot.url,
    hash: snapshot.pending.hash,
    text: snapshot.pending.text,
    fetchedAt: snapshot.pending.fetchedAt,
  };
};

export class MemorySnapshotStore implements SnapshotStore {
  readonly #snapshots = new Map<string, PageSnapshot>();
  readonly #deliveries = new Map<string, DeliveryState>();

  async get(url: string): Promise<PageSnapshot | null> {
    return this.#snapshots.get(url) ?? null;
  }

  async set(snapshot: PageSnapshot): Promise<void> {
    this.#snapshots.set(snapshot.url, snapshot);
  }

  async commitPending(url: string): Promise<PageSnapshot | null> {
    const current = this.#snapshots.get(url);
    if (!current) {
      return null;
    }
    const committed = promotePending(current);
    this.#snapshots.set(url, committed);
    return committed;
  }

  async list(): Promise<readonly PageSnapshot[]> {
    return [...this.#snapshots.values()];
  }

  async getDelivery(idempotencyKey: string): Promise<DeliveryState | null> {
    return this.#deliveries.get(idempotencyKey) ?? null;
  }

  async setDelivery(idempotencyKey: string, state: DeliveryState): Promise<void> {
    this.#deliveries.set(idempotencyKey, state);
  }
}

export class FileSnapshotStore implements SnapshotStore {
  constructor(private readonly filePath: string) {}

  async get(url: string): Promise<PageSnapshot | null> {
    const document = await this.#read();
    return document.snapshots[url] ?? null;
  }

  async set(snapshot: PageSnapshot): Promise<void> {
    await this.#update((document) => ({
      ...document,
      snapshots: { ...document.snapshots, [snapshot.url]: snapshot },
    }));
  }

  async commitPending(url: string): Promise<PageSnapshot | null> {
    const document = await this.#update((current) => {
      const snapshot = current.snapshots[url];
      if (!snapshot) {
        return current;
      }
      return {
        ...current,
        snapshots: { ...current.snapshots, [url]: promotePending(snapshot) },
      };
    });
    return document.snapshots[url] ?? null;
  }

  async list(): Promise<readonly PageSnapshot[]> {
    return Object.values((await this.#read()).snapshots);
  }

  async getDelivery(idempotencyKey: string): Promise<DeliveryState | null> {
    const document = await this.#read();
    return document.deliveries[idempotencyKey] ?? null;
  }

  async setDelivery(idempotencyKey: string, state: DeliveryState): Promise<void> {
    await this.#update((document) => ({
      ...document,
      deliveries: { ...document.deliveries, [idempotencyKey]: state },
    }));
  }

  get #lockPath(): string {
    return `${this.filePath}.lock`;
  }

  async #update(mutator: (document: StoreDocument) => StoreDocument): Promise<StoreDocument> {
    return withFileLock(this.#lockPath, async () => {
      const document = await this.#readUnlocked();
      const next = mutator(document);
      await mkdir(path.dirname(this.filePath), { recursive: true });
      const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
      await writeFile(tempPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
      await rename(tempPath, this.filePath);
      return next;
    });
  }

  async #read(): Promise<StoreDocument> {
    return withFileLock(this.#lockPath, () => this.#readUnlocked());
  }

  async #readUnlocked(): Promise<StoreDocument> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<StoreDocument>;
      if (!parsed || typeof parsed !== "object" || !parsed.snapshots) {
        return emptyDocument();
      }
      return {
        snapshots: parsed.snapshots,
        deliveries: parsed.deliveries ?? {},
      };
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
    return this.#getJson<PageSnapshot>(`${REDIS_SNAPSHOT_PREFIX}${url}`);
  }

  async set(snapshot: PageSnapshot): Promise<void> {
    await this.#setJson(`${REDIS_SNAPSHOT_PREFIX}${snapshot.url}`, snapshot);
    const sadd = await this.fetchImpl(
      `${this.#base()}/sadd/${encodeURIComponent(REDIS_INDEX_KEY)}/${encodeURIComponent(snapshot.url)}`,
      { method: "POST", headers: this.#headers() },
    );
    if (!sadd.ok) {
      throw new Error(`Redis snapshot index write failed with HTTP ${sadd.status}.`);
    }
  }

  async commitPending(url: string): Promise<PageSnapshot | null> {
    const current = await this.get(url);
    if (!current) {
      return null;
    }
    const committed = promotePending(current);
    await this.set(committed);
    return committed;
  }

  async list(): Promise<readonly PageSnapshot[]> {
    const members = await this.#smembers(REDIS_INDEX_KEY);
    const snapshots: PageSnapshot[] = [];
    for (const url of members) {
      const snapshot = await this.get(url);
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }
    return snapshots;
  }

  async getDelivery(idempotencyKey: string): Promise<DeliveryState | null> {
    return this.#getJson<DeliveryState>(`${REDIS_DELIVERY_PREFIX}${idempotencyKey}`);
  }

  async setDelivery(idempotencyKey: string, state: DeliveryState): Promise<void> {
    await this.#setJson(`${REDIS_DELIVERY_PREFIX}${idempotencyKey}`, state);
  }

  #base(): string {
    return this.restUrl.replace(/\/+$/, "");
  }

  #headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  async #setJson(key: string, value: unknown): Promise<void> {
    const response = await this.fetchImpl(`${this.#base()}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: this.#headers(),
      body: JSON.stringify(value),
    });
    if (!response.ok) {
      throw new Error(`Redis snapshot write failed with HTTP ${response.status}.`);
    }
  }

  async #getJson<T>(key: string): Promise<T | null> {
    const response = await this.fetchImpl(`${this.#base()}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Redis snapshot read failed with HTTP ${response.status}.`);
    }
    const payload = (await response.json()) as { result?: string | T | null };
    if (!payload.result) {
      return null;
    }
    if (typeof payload.result === "string") {
      try {
        return JSON.parse(payload.result) as T;
      } catch {
        return null;
      }
    }
    return payload.result;
  }

  async #smembers(key: string): Promise<readonly string[]> {
    const response = await this.fetchImpl(`${this.#base()}/smembers/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      throw new Error(`Redis snapshot index read failed with HTTP ${response.status}.`);
    }
    const payload = (await response.json()) as { result?: unknown };
    if (!Array.isArray(payload.result)) {
      return [];
    }
    return payload.result.filter((item): item is string => typeof item === "string");
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

export type RecordedSnapshot =
  | {
      readonly ok: true;
      readonly previousFetchedAt?: string;
      readonly pendingDelivery: boolean;
    } & ScoredChange
  | {
      readonly ok: false;
      readonly url: string;
      readonly hashMismatch: true;
      readonly expectedHash: string;
      readonly note: string;
    };

export const recordFetchedSnapshot = async ({
  store,
  url,
  text,
  hash,
  fetchedAt,
  thresholds,
}: {
  store: SnapshotStore;
  url: string;
  text: string;
  hash: string;
  fetchedAt: string;
  thresholds: AlertThresholds;
}): Promise<RecordedSnapshot> => {
  const expectedHash = hashNormalizedText(text);
  if (hash !== expectedHash) {
    return {
      ok: false,
      url,
      hashMismatch: true,
      expectedHash,
      note: "hash does not match the SHA-256 digest of text. Re-fetch and pass the tool-computed hash.",
    };
  }

  const previous = await store.get(url);
  if (!previous) {
    await store.set({ url, hash, text, fetchedAt });
    return {
      ok: true,
      pendingDelivery: false,
      ...toScoredChange({
        url,
        fetchedAt,
        isBaseline: true,
        diff: {
          changed: false,
          changedChars: 0,
          score: 0,
          addedWords: [],
          removedWords: [],
          excerpt: "",
        },
        thresholds,
      }),
    };
  }

  if (previous.hash === hash) {
    return {
      ok: true,
      pendingDelivery: false,
      ...toScoredChange({
        url,
        fetchedAt,
        isBaseline: false,
        diff: {
          changed: false,
          changedChars: 0,
          score: 0,
          addedWords: [],
          removedWords: [],
          excerpt: "",
        },
        thresholds,
      }),
    };
  }

  const scored = toScoredChange({
    url,
    fetchedAt,
    isBaseline: false,
    diff: diffNormalizedText(previous.text, text),
    thresholds,
  });

  if (scored.clearsThreshold) {
    await store.set({
      url: previous.url,
      hash: previous.hash,
      text: previous.text,
      fetchedAt: previous.fetchedAt,
      pending: { hash, text, fetchedAt },
    });
  } else {
    await store.set({ url, hash, text, fetchedAt });
  }

  return {
    ok: true,
    previousFetchedAt: previous.fetchedAt,
    pendingDelivery: scored.clearsThreshold,
    ...scored,
  };
};
