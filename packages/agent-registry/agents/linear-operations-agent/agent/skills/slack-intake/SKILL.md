---
name: slack-intake
description: Turn a Slack thread into structured Linear work while preserving decisions, action items, and missing context.
---

# Slack intake

Use when a Slack mention asks to summarize a thread, create a Linear issue, link
discussion to an issue, or identify what is missing before ticket creation.

## Process

1. Read the provided thread context. **Done when** discussion, decisions, action
   items, evidence, and unresolved questions are separated.
2. Draft a Linear issue title and body from that structure.
3. Suggest team, priority, labels, and project only when evidence supports them.
4. After approval, create or modify the Linear issue and respond in Slack with
   the Linear link and what was included.

## Output

Use the agent default response shape, plus thread summary, decision or action,
and proposed Linear issue.
