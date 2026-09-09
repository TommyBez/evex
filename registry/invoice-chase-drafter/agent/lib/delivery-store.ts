import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type DigestDelivery = {
  readonly idempotencyKey: string;
  readonly runDate: string;
  readonly slackSent: boolean;
  readonly postedAt: string;
};

export type DeliveryStore = {
  readonly path: string;
  find(idempotencyKey: string): DigestDelivery | undefined;
  save(delivery: DigestDelivery): void;
};

type StoreFile = {
  readonly deliveries: readonly DigestDelivery[];
};

const readStore = (filePath: string): StoreFile => {
  if (!existsSync(filePath)) {
    return { deliveries: [] };
  }
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as StoreFile;
    return {
      deliveries: Array.isArray(parsed.deliveries) ? parsed.deliveries : [],
    };
  } catch {
    return { deliveries: [] };
  }
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
      const current = readStore(filePath);
      const next = {
        deliveries: [
          ...current.deliveries.filter(
            (item) => item.idempotencyKey !== delivery.idempotencyKey,
          ),
          delivery,
        ],
      };
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`);
    },
  };
}
