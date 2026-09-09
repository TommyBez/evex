import type { EnrichedLead } from "./enrich";
import type { IcpScore } from "./score";

export function draftCrmNoteBody(input: {
  readonly lead: EnrichedLead;
  readonly score: IcpScore;
}): string {
  const name = [input.lead.lead.firstName, input.lead.lead.lastName]
    .filter(Boolean)
    .join(" ");
  const lines = [
    `Inbound lead qualification (${input.score.band}, ${input.score.score}/100).`,
    name ? `Name: ${name}` : undefined,
    `Email: ${input.lead.email}`,
    `Company: ${input.lead.company}`,
    input.lead.lead.title ? `Title: ${input.lead.lead.title}` : undefined,
    input.score.reasons.length > 0
      ? `Why: ${input.score.reasons.join(" ")}`
      : undefined,
    input.lead.lead.message
      ? `Submitted message (untrusted): ${input.lead.lead.message}`
      : undefined,
  ];
  return lines.filter(Boolean).join("\n");
}
