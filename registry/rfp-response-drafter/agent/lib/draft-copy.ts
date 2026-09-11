import type { DraftSection } from "./cite-gate";

export function formatDraftBody(input: {
  readonly rfpTitle: string;
  readonly sections: readonly DraftSection[];
}): string {
  const blocks = input.sections.map((section) => {
    const citations = section.claims
      .map((claim) => {
        const locator = claim.citation.locator
          ? ` ${claim.citation.locator}`
          : "";
        return `- ${claim.text} [${claim.citation.sourceId}${locator}]`;
      })
      .join("\n");
    return `## ${section.heading}\n\n${section.body}\n\nCitations:\n${citations}`;
  });
  return [`# DRAFT: ${input.rfpTitle}`, "", ...blocks].join("\n");
}

export function draftMailboxSubject(rfpTitle: string): string {
  return `DRAFT (not submitted): ${rfpTitle}`;
}
