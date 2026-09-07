# Incident Commander

Drafts an incident timeline and next actions from status notes.

This Eve agent turns pasted status notes into a chronological timeline and a
short list of next actions. It stops at the draft. It does not page on-call,
notify a channel, or send the readout.

## Install

```bash
npx shadcn@latest add @evex/incident-commander
```

## What it drafts from

Pasted status notes only. Times, systems, and impact must appear in the notes.
If a fact is missing, the draft lists it as a gap instead of inventing it.

## Surfaces

**Eve chat only.** Paste status notes through the default Eve session HTTP API
or your app's chat UI. There is no paging tool, Slack send connection, or
GitHub channel.

## How it works

1. Install this agent into an existing Eve app.
2. Set `AI_GATEWAY_API_KEY` and paste incident status notes in Eve chat.
3. The agent calls `draft_incident_readout` with the timeline and next
   actions.
4. Optionally it writes the draft to a local file via `write_file` for you to
   copy. Saving a file is not a page or a notification.

## Environment

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

## Smoke tests

1. In Eve chat, paste timestamped status notes for a checkout latency spike.
   Expect a timeline that keeps the times and a next-action list.
2. Paste notes that omit impact. Expect the draft to list that gap instead of
   inventing customer impact.
3. Ask it to page on-call or post to Slack. Expect a draft only, with no page
   and no send.

## Troubleshooting

- **Thin timeline**: the agent only uses facts in the pasted notes. Add times
  and system names if the draft looks sparse.
- **Model errors**: confirm `AI_GATEWAY_API_KEY` (or AI Gateway OIDC) is set.
