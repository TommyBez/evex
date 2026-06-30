---
name: duplicate-detection
description: Find likely duplicate Linear issues, compare evidence, and propose link, merge, or closure actions.
---

# Duplicate detection

Use when a user asks whether an issue is duplicated or related.

## Process

1. Extract search terms from title, description, error messages, product area,
   labels, and comments.
2. Use `list_issues` with targeted queries. **Done when** at least one search
   has run.
3. Use `get_issue` on the strongest candidates before recommending. **Done when**
   each candidate's scope, symptoms, environment, impacted user flow, and status
   are compared.
4. Recommend the canonical issue to keep open.
5. Propose duplicate links, status changes, or closures only after comparison is
   complete.

## Output

Use the agent default response shape, plus candidate duplicates, why they match
or do not match, recommended canonical issue, and proposed Linear action.
