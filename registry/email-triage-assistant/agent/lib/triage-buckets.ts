export const DEFAULT_TRIAGE_BUCKETS = [
  "needs-reply",
  "fyi",
  "waiting",
  "urgent",
  "newsletter",
  "no-reply",
] as const;

export type DefaultTriageBucket = (typeof DEFAULT_TRIAGE_BUCKETS)[number];

const BUCKET_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GMAIL_LABEL_PREFIX = "triage/";
const IMAP_FOLDER_PREFIX = "Triage/";

export function parseTriageBuckets(value: string | undefined): string[] {
  const parsed = (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const unique: string[] = [];
  for (const bucket of parsed) {
    if (!BUCKET_SLUG.test(bucket) || unique.includes(bucket)) {
      continue;
    }
    unique.push(bucket);
  }

  return unique.length > 0 ? unique : [...DEFAULT_TRIAGE_BUCKETS];
}

export function isKnownTriageBucket(
  bucket: string,
  allowed: readonly string[],
): boolean {
  return allowed.includes(bucket.trim().toLowerCase());
}

export function gmailLabelForBucket(bucket: string): string {
  return `${GMAIL_LABEL_PREFIX}${bucket.trim().toLowerCase()}`;
}

export function imapFolderForBucket(bucket: string): string {
  return `${IMAP_FOLDER_PREFIX}${bucket.trim().toLowerCase()}`;
}

export function graphCategoryForBucket(bucket: string): string {
  return `triage/${bucket.trim().toLowerCase()}`;
}

export function isTriageMarker(label: string): boolean {
  const normalized = label.replace(/^\\/, "").trim().toLowerCase();
  return normalized === "draft" || normalized.startsWith("triage/");
}

export function hasTriageMarker(labels: readonly string[]): boolean {
  return labels.some((label) => isTriageMarker(label));
}
