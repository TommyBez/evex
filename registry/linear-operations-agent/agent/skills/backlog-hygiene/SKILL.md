---
name: backlog-hygiene
description: Find stale, obsolete, duplicate, under-specified, ownerless, and priorityless Linear backlog issues.
---

# Backlog hygiene

Use for backlog cleanup requests or weekly backlog hygiene schedules.

## Process

1. Read configured team and project backlogs. **Done when** each configured
   backlog has been scanned.
2. Identify stale, obsolete, duplicate, ownerless, priorityless, and unclear
   issues.
3. Group findings by recommended action.
4. Keep bulk recommendations under the configured max bulk issue count unless
   asked otherwise.
5. Propose cleanup actions instead of applying them automatically.

## Output

Use the agent default response shape, plus backlog findings, suggested cleanup
actions, duplicates or obsolete issues, and clarification candidates.
