export type IssueDigestConfig = {
  readonly cron: string;
  readonly from?: string;
  readonly installationId?: number;
  readonly repo?: string;
  readonly subject: string;
  readonly to: readonly string[];
};

const DEFAULT_CRON = "0 9 * * 1";
const DEFAULT_SUBJECT = "Weekly open-issue digest";

const optional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const compactCsv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parsePositiveInteger = (
  value: string | undefined,
): number | undefined => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export const issueDigestConfig = {
  cron: optional(process.env.ISSUE_DIGEST_CRON) ?? DEFAULT_CRON,
  from: optional(process.env.ISSUE_DIGEST_FROM),
  installationId: parsePositiveInteger(
    process.env.GITHUB_APP_INSTALLATION_ID,
  ),
  repo: optional(process.env.ISSUE_DIGEST_REPO),
  subject: optional(process.env.ISSUE_DIGEST_SUBJECT) ?? DEFAULT_SUBJECT,
  to: compactCsv(process.env.ISSUE_DIGEST_TO),
} satisfies IssueDigestConfig;

export function parseOwnerRepo(repo: string): {
  readonly owner: string;
  readonly repo: string;
} {
  const [owner, name, ...rest] = repo.split("/");
  if (!(owner && name) || rest.length > 0) {
    throw new Error(
      `ISSUE_DIGEST_REPO must be owner/repo (got ${JSON.stringify(repo)}).`,
    );
  }
  return { owner, repo: name };
}
