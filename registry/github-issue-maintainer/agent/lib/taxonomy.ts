export const ISSUE_LABELS = [
  "bug",
  "feature",
  "docs",
  "question",
  "chore",
] as const;

export type IssueLabel = (typeof ISSUE_LABELS)[number];

export const ISSUE_LABEL_SET = new Set<string>(ISSUE_LABELS);

export const TAXONOMY_GUIDE = `Use exactly one primary label from this taxonomy:

- bug: something is broken or behaves incorrectly
- feature: a request for new capability or behavior
- docs: documentation gaps, typos, or clarification asks
- question: seeking guidance without asking for a product change
- chore: maintenance, dependencies, CI, or repo housekeeping

Do not invent labels outside this list. Prefer bug over question when a
reproducible failure is described. Prefer feature over question when the
author is clearly requesting new behavior.`;
