---
name: issue-triage
description: Label a GitHub issue from the small taxonomy and decide whether to ask for missing repro details.
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

## Thin issues

An issue is thin when any of these are missing for a `bug` (and often helpful
for `feature`):

- reproduction steps
- expected vs actual behavior
- environment (OS, runtime/browser, package versions)

When thin, call `triage_issue` with `requestRepro=true` and a short comment
that asks only for the missing pieces. Do not lecture. Do not demand a perfect
template when the report is already actionable.

## Boundaries

- Triage issues only. Never review pull requests.
- Never call PR review tools or publish GitHub pull request reviews.
- Prefer labeling plus one focused ask over long commentary.
