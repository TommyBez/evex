import type { RiskBucket, ScoredAccount } from "./score";

export function draftSavePlayBody(input: {
  readonly scored: Pick<ScoredAccount, "account" | "bucket" | "reasons">;
  readonly play?: string;
}): string {
  const play =
    input.play?.trim() ||
    defaultPlay(input.scored.bucket, input.scored.account.name);
  const lines = [
    `Renewal save play (${input.scored.bucket}).`,
    `Account: ${input.scored.account.name}`,
    input.scored.account.renewalDate
      ? `Renewal: ${input.scored.account.renewalDate}`
      : undefined,
    input.scored.account.ownerEmail
      ? `Owner: ${input.scored.account.ownerEmail}`
      : undefined,
    input.scored.reasons.length > 0
      ? `Why: ${input.scored.reasons.join(" ")}`
      : undefined,
    `Play: ${play}`,
    "Do not email the customer from this agent.",
  ];
  return lines.filter(Boolean).join("\n");
}

function defaultPlay(bucket: RiskBucket, name: string): string {
  if (bucket === "at-risk") {
    return `Owner outreach and a save offer for ${name} before renewal.`;
  }
  if (bucket === "watch") {
    return `Owner check-in and expansion probe for ${name} in the renewal window.`;
  }
  return `Owner confirmation that ${name} is on track to renew.`;
}
