# RFP Response Drafter

RFP response drafter via Google Drive Connect and sandbox files that cites every claim, Slack-routes SME gaps, and write-backs approved Drive or mailbox drafts without portal submit.

The agent reads an RFP and a knowledge pack from Google Drive Connect and/or sandbox files, drafts sectioned answers with file citations, routes open questions to SMEs on Slack, and writes an approved draft as a Drive Doc and/or a mailbox Drafts message. It never submits a vendor portal response and never pastes text as write-back.

## What it does

1. **Load config** — `load_rfp_config` reports Drive, sandbox roots, Slack, mailbox, and the write-back target.
2. **Ingest and materialize** — `ingest_rfp_sources` reads Drive files through Vercel Connect and materializes sandbox paths under `RFP_RESPONSE_SANDBOX_ROOTS`. That path is read-only.
3. **Cite gate** — `draft_cited_sections` requires a file citation on every claim and fails closed when a claim is uncited.
4. **SME Slack pause** — `ask_sme_questions` posts open questions through the Eve Slack Connect channel and pauses for SME approval.
5. **Approved draft only** — `write_approved_draft` pauses for Eve approval, requires `confirmWrite: true`, and writes a Drive draft Doc and/or mailbox Drafts. It always returns `submitted: false` and `sent: false`.
6. **Optional deadline digest** — `rfp-deadline-digest` on `RFP_RESPONSE_CRON` previews upcoming due dates and posts Slack once per date key.

## Installation

```bash
npx shadcn@latest add @evex/rfp-response-drafter
```

## Configuration

Copy `.env.example` into your Eve app environment. Set Slack Connect plus at least one write-back target (Google Drive Connect or a mailbox).

### Schedule and store

- `RFP_RESPONSE_CRON` — 5-field cron (UTC on Vercel). Defaults to `0 8 * * 1-5`.
- `RFP_RESPONSE_STORE_PATH` — JSON file for digest delivery claims. Defaults to `.data/rfp-response-store.json`. Use a durable volume in production.
- `RFP_RESPONSE_SANDBOX_ROOTS` — comma-separated sandbox roots. Defaults to `rfps,knowledge-packs`.
- `RFP_RESPONSE_WRITEBACK` — `drive`, `mailbox`, or `both`. Empty uses Drive when a Google Connect UID is set, or mailbox when a draft recipient is set.

### Slack (Vercel Connect)

Uses the Eve Slack channel (`agent/channels/slack.ts`) with Vercel Connect.
Create a Slack connector and attach triggers to `/eve/v1/slack`
(`vercel connect create slack --triggers`, or `eve add channel/slack`).

- `RFP_RESPONSE_SLACK_CONNECT_UID` — Connect Slack connector UID.
- `RFP_RESPONSE_SLACK_CHANNEL_ID` — Slack channel id for SME questions and the optional digest.

Both are required before `ask_sme_questions` or `deliver_deadline_digest` will post. Those tools still pause for Eve approval.

### Google Drive via Vercel Connect

- `RFP_RESPONSE_GOOGLE_CONNECT_UID` — from `vercel connect create google`.
- `RFP_RESPONSE_DRIVE_FOLDER_ID` — optional Drive folder to list.
- `RFP_RESPONSE_GMAIL_USER` — optional From address written onto Gmail drafts.

Drive read uses `drive.readonly`. Draft Docs use `drive.file` and `documents`. Gmail drafts use `gmail.compose`. The runtime write guard refuses portal submit URLs, `messages.send`, `drafts.send`, `sendMail`, and SMTP.

### Mailbox via Vercel Connect (Drafts only)

- `RFP_RESPONSE_MAILBOX_PROVIDER` — `gmail` or `outlook`. Empty uses the first complete mailbox Connect UID.
- `RFP_RESPONSE_DRAFT_TO` — required recipient for mailbox Drafts.
- `RFP_RESPONSE_MICROSOFT_CONNECT_UID` — from `vercel connect create microsoft`.

Graph uses `Mail.ReadWrite`. The agent never calls `sendMail`.

## Smoke test

1. Set Slack Connect (UID + channel id) and a Google Connect UID. Optionally drop an RFP under `rfps/` and a pack under `knowledge-packs/`.
2. In Eve chat: load config, ingest the sandbox paths, draft cited sections, ask any SME questions, then write the approved draft with `confirmWrite: true`.
3. Trigger the optional digest in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/rfp-deadline-digest
   ```

4. Nothing is submitted to a portal. Mailbox and Drive writes still require approval.

## Troubleshooting

- **`notConfigured: missingEnv RFP_RESPONSE_SLACK_CONNECT_UID`** — Slack SME routing is required.
- **`notConfigured: missingEnv RFP_RESPONSE_WRITEBACK`** — set a Google Connect UID or a mailbox plus `RFP_RESPONSE_DRAFT_TO`.
- **`Cite gate failed closed`** — a claim had no file citation, or the citation was not in the ingested pack.
- **`confirmWrite must be true`** — `write_approved_draft` refuses until after Eve and SME approval.
- **`Refused portal submit`** — intent was `submit` or `paste`, or a provider tried a portal URL.
- **Slack replayed** — the same `rfp-response-drafter-YYYY-MM-DD` key already posted.
