import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export const DELIVERY_CLAIM_TTL_MS = 120_000;
const LOCK_RETRIES = 50;
const LOCK_WAIT_MS = 20;

export type DigestDelivery = {
  readonly idempotencyKey: string;
  readonly runDate: string;
  readonly slackSent: boolean;
  readonly postedAt?: string;
  readonly claimedAt?: string;
  readonly claimOwner?: string;
  readonly status?: "in_progress" | "complete";
};

export type DeliveryClaim = {
  readonly acquired: boolean;
  readonly inProgress: boolean;
  readonly replayed: boolean;
  readonly state?: DigestDelivery;
};

export type DeliveryStore = {
  readonly path: string;
  find(idempotencyKey: string): DigestDelivery | undefined;
  save(delivery: DigestDelivery): void;
  claim(idempotencyKey: string, runDate: string): DeliveryClaim;
  release(idempotencyKey: string): void;
};

type StoreFile = {
  readonly deliveries: readonly DigestDelivery[];
};

export const isProcessAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
};

const sleepSync = (ms: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

const emptyStore = (): StoreFile => ({ deliveries: [] });

const readStore = (filePath: string): StoreFile => {
  if (!existsSync(filePath)) {
    return emptyStore();
  }
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as StoreFile;
    return {
      deliveries: Array.isArray(parsed.deliveries) ? parsed.deliveries : [],
    };
  } catch {
    return emptyStore();
  }
};

export const writeStoreAtomically = (
  filePath: string,
  document: StoreFile,
): void => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(document, null, 2)}\n`);
  renameSync(tempPath, filePath);
};

const replaceDelivery = (
  document: StoreFile,
  delivery: DigestDelivery,
): StoreFile => ({
  deliveries: [
    ...document.deliveries.filter(
      (item) => item.idempotencyKey !== delivery.idempotencyKey,
    ),
    delivery,
  ],
});

const removeDelivery = (
  document: StoreFile,
  idempotencyKey: string,
): StoreFile => ({
  deliveries: document.deliveries.filter(
    (item) => item.idempotencyKey !== idempotencyKey,
  ),
});

const readLockOwner = (lockPath: string): { pid: number | null } | null => {
  try {
    const pid = Number.parseInt(readFileSync(lockPath, "utf8").trim(), 10);
    return {
      pid: Number.isInteger(pid) && pid > 0 ? pid : null,
    };
  } catch {
    return null;
  }
};

const reclaimAbandonedLock = (lockPath: string): void => {
  const owner = readLockOwner(lockPath);
  if (!owner) {
    return;
  }
  if (owner.pid !== null && isProcessAlive(owner.pid)) {
    return;
  }
  try {
    unlinkSync(lockPath);
  } catch {
    // Another process may have already removed the lock.
  }
};

const withStoreLock = <T>(filePath: string, work: () => T): T => {
  const lockPath = `${filePath}.lock`;
  mkdirSync(path.dirname(filePath), { recursive: true });
  for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
    try {
      const fd = openSync(lockPath, "wx");
      try {
        writeFileSync(fd, `${process.pid}\n`);
        return work();
      } finally {
        closeSync(fd);
        try {
          unlinkSync(lockPath);
        } catch {
          // Lock file already gone.
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
      reclaimAbandonedLock(lockPath);
      sleepSync(LOCK_WAIT_MS);
    }
  }
  throw new Error("Timed out waiting for the invoice chase store lock.");
};

export const isLiveDeliveryClaim = (
  existing: DigestDelivery,
  nowMs = Date.now(),
): boolean => {
  if (existing.slackSent || existing.status === "complete") {
    return false;
  }
  const owner = Number.parseInt(existing.claimOwner ?? "", 10);
  if (Number.isInteger(owner) && owner > 0) {
    return isProcessAlive(owner);
  }
  if (!existing.claimedAt) {
    return false;
  }
  const claimedAt = Date.parse(existing.claimedAt);
  if (!Number.isFinite(claimedAt)) {
    return false;
  }
  return nowMs - claimedAt < DELIVERY_CLAIM_TTL_MS;
};

export const evaluateDeliveryClaim = (
  existing: DigestDelivery | undefined,
  next: DigestDelivery,
  nowMs = Date.now(),
): DeliveryClaim => {
  if (!existing) {
    return { acquired: true, inProgress: false, replayed: false, state: next };
  }
  if (existing.slackSent || existing.status === "complete") {
    return {
      acquired: false,
      inProgress: false,
      replayed: true,
      state: existing,
    };
  }
  if (isLiveDeliveryClaim(existing, nowMs)) {
    return {
      acquired: false,
      inProgress: true,
      replayed: false,
      state: existing,
    };
  }
  return { acquired: true, inProgress: false, replayed: false, state: next };
};

export function createDeliveryStore(filePath: string): DeliveryStore {
  return {
    path: filePath,
    find(idempotencyKey) {
      return readStore(filePath).deliveries.find(
        (delivery) => delivery.idempotencyKey === idempotencyKey,
      );
    },
    save(delivery) {
      withStoreLock(filePath, () => {
        writeStoreAtomically(
          filePath,
          replaceDelivery(readStore(filePath), delivery),
        );
      });
    },
    claim(idempotencyKey, runDate) {
      return withStoreLock(filePath, () => {
        const existing = readStore(filePath).deliveries.find(
          (delivery) => delivery.idempotencyKey === idempotencyKey,
        );
        const next: DigestDelivery = {
          idempotencyKey,
          runDate,
          slackSent: false,
          claimedAt: new Date().toISOString(),
          claimOwner: String(process.pid),
          status: "in_progress",
        };
        const claim = evaluateDeliveryClaim(existing, next);
        if (claim.acquired && claim.state) {
          writeStoreAtomically(
            filePath,
            replaceDelivery(readStore(filePath), claim.state),
          );
        }
        return claim;
      });
    },
    release(idempotencyKey) {
      withStoreLock(filePath, () => {
        const existing = readStore(filePath).deliveries.find(
          (delivery) => delivery.idempotencyKey === idempotencyKey,
        );
        if (!existing || existing.slackSent) {
          return;
        }
        writeStoreAtomically(
          filePath,
          removeDelivery(readStore(filePath), idempotencyKey),
        );
      });
    },
  };
}
