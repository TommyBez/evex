import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

export type DigestDelivery = {
  readonly idempotencyKey: string;
  readonly runDate: string;
  readonly slackSent: boolean;
  readonly postedAt?: string;
};

export type DeliveryStore = {
  readonly path: string;
  find(idempotencyKey: string): DigestDelivery | undefined;
  save(delivery: DigestDelivery): void;
};

type StoreFile = {
  readonly deliveries: readonly DigestDelivery[];
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

const writeStoreAtomically = (filePath: string, document: StoreFile): void => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(document, null, 2)}\n`);
  renameSync(tempPath, filePath);
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
      const document = readStore(filePath);
      writeStoreAtomically(filePath, {
        deliveries: [
          ...document.deliveries.filter(
            (item) => item.idempotencyKey !== delivery.idempotencyKey,
          ),
          delivery,
        ],
      });
    },
  };
}
