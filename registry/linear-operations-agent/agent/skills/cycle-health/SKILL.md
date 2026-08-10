---
name: cycle-health
description: Analyze Linear cycle health, including blocked work, stale updates, scope creep, owner overload, and risky current-cycle issues.
---

# Cycle health

Use for current-cycle reports or schedule-driven cycle health checks.

## Process

1. Identify configured teams and their current cycle. **Done when** each
   configured team's active cycle is known.
2. Read open and recently completed cycle issues.
3. Flag blocked issues, stale P0/P1 work, ownerless work, work added after cycle
   start, and completed work not closed. **Done when** each flag category is
   checked.
4. Look for owner overload and unresolved dependencies.
5. Keep the Slack report concise and action-oriented.
6. Do not update Linear automatically during scheduled cycle reports.

## Output

Use the agent default response shape, plus health status, key risks, issues
needing attention, scope changes, and recommended standup topics.
