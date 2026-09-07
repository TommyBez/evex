# Airtable Feedback Grouper

Clusters Airtable feedback into themes with example quotes.

This Eve agent clusters pasted or exported Airtable feedback into themes and
keeps example quotes from the rows. It stops at the draft. It does not write
back to Airtable and it does not need an Airtable API token.

## Install

```bash
npx shadcn@latest add @evex/airtable-feedback-grouper
```

## What it drafts from

Pasted rows, CSV, or an export the operator drops into Eve chat. Quotes must
come from that paste. The MVP is draft-only analysis. There is no required
Airtable write token.

## Surfaces

**Eve chat only.** Paste exported feedback through the default Eve session
HTTP API or your app's chat UI. There is no Airtable write connection and no
GitHub channel.

## How it works

1. Install this agent into an existing Eve app.
2. Set `AI_GATEWAY_API_KEY` and paste exported feedback in Eve chat.
3. The agent calls `draft_feedback_themes` with themes and example quotes.
4. Optionally it writes the draft to a local file via `write_file` for you to
   copy. Saving a file is not an Airtable write.

## Environment

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

## Smoke tests

1. In Eve chat, paste four feedback rows that cover two themes. Expect named
   themes and quotes copied from the paste.
2. Paste a single vague row. Expect it to stay leftover instead of inventing
   a quote.
3. Ask it to write the themes back to Airtable. Expect a draft only, with no
   Airtable write.

## Troubleshooting

- **Invented quotes**: the agent should copy wording from the paste. If a
  quote looks polished, treat it as a miss and re-run with the raw export.
- **Model errors**: confirm `AI_GATEWAY_API_KEY` (or AI Gateway OIDC) is set.
