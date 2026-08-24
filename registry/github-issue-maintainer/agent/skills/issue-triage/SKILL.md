---
name: issue-triage
description: Label a GitHub issue from the small taxonomy and decide whether to ask for missing repro details on bug reports.
---

# Issue triage

Use this skill when triaging a newly opened GitHub issue or when mentioned on
an issue thread.

## Taxonomy

Choose labels only from:

- `bug`
- `feature`
- `docs`
- `question`
- `chore`

Apply one primary label. Add `docs` as a second label only when the issue is
primarily about documentation and also clearly a bug or feature.

## Thin issues (bugs only)

Classify the label first. Thin-report requirements apply only when the primary
label is `bug`. An issue is thin when any of these are missing:

- reproduction steps
- expected vs actual behavior
- environment (OS, runtime/browser, package versions)

When the label is `bug` and the report is thin, call `triage_issue` with
`requestRepro=true` and a short comment that asks only for the missing pieces.
Do not lecture. Do not demand a perfect template when the report is already
actionable.

Never set `requestRepro=true` for `feature`, `docs`, `question`, or `chore`
just because those reports lack repro keywords.

## Boundaries

- Triage issues only. Never review pull requests.
- Never call PR review tools or publish GitHub pull request reviews.
- Prefer labeling plus one focused ask over long commentary.
