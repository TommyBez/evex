# RFP Response Drafter

RFP response drafter via Google Drive Connect and sandbox files that cites every claim, Slack-routes SME gaps, and write-backs approved Drive or mailbox drafts without portal submit.

The agent reads an RFP and a knowledge pack from Google Drive Connect and/or sandbox files, drafts sectioned answers with file citations, routes open questions to SMEs on Slack, and writes an approved draft as a Drive Doc and/or a mailbox Drafts message. It never submits a vendor portal response and never pastes text as write-back.

## What it does

1. **Load config** — `load_rfp_config` reports Drive RFP and knowledge folders, sandbox roots, Slack, mailbox, and the write-back target.
2. **Ingest into the workspace** — `ingest_rfp_sources` lists the configured Drive folders, exports Docs and PDFs into `/workspace/rfps` and `/workspace/knowledge-packs`, and registers sandbox paths. It returns paths and Drive ids only. Read those files with built-in `read_file`, `glob`, and `grep`.
3. **Cite gate** — `draft_cited_sections` requires every claim to cite a pack path and/or a Drive file id or URL. It fails closed when a claim is uncited or the source is missing.
4. **SME Slack pause** — `ask_sme_questions` posts open questions through the Eve Slack Connect channel and pauses for SME approval before any external-facing draft leaves.
5. **Approved draft only** — `write_approved_draft` pauses for Eve approval, requires `confirmWrite: true` and SME approval when questions are open, and writes a Drive draft Doc and/or mailbox Drafts. It always returns `submitted: false` and `sent: false`.
6. **Optional deadline digest** — `rfp-deadline-digest` on `RFP_RESPONSE_CRON` previews aging buckets and posts Slack and/or Resend email once per date key.

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

Both are required before `ask_sme_questions` will post. The deadline digest can use Slack and/or Resend email. Those tools still pause for Eve approval.

### Google Drive via Vercel Connect

- `RFP_RESPONSE_GOOGLE_CONNECT_UID` — from `vercel connect create google`.
- `RFP_RESPONSE_DRIVE_RFP_FOLDER_ID` — Drive folder that holds questionnaires.
- `RFP_RESPONSE_DRIVE_PACK_FOLDER_ID` — Drive folder that holds the knowledge pack.
- `RFP_RESPONSE_DRIVE_FOLDER_ID` — optional shared fallback when a specific folder is empty.
- `RFP_RESPONSE_GMAIL_USER` — optional From address written onto Gmail drafts.

Drive read uses `drive.readonly`. Docs export as `text/plain`. PDFs download with `alt=media`. Draft Docs use `drive.file` and `documents`. Gmail drafts use `gmail.compose`. The runtime write guard refuses portal submit URLs, `messages.send`, `drafts.send`, `sendMail`, and SMTP.

### Mailbox via Vercel Connect (Drafts only)

- `RFP_RESPONSE_MAILBOX_PROVIDER` — `gmail` or `outlook`. Empty uses the first complete mailbox Connect UID.
- `RFP_RESPONSE_DRAFT_TO` — required recipient for mailbox Drafts.
- `RFP_RESPONSE_MICROSOFT_CONNECT_UID` — from `vercel connect create microsoft`.

Graph uses `Mail.ReadWrite`. The agent never calls `sendMail`.

### Optional digest email (Resend)

- `RESEND_API_KEY` — Resend API key for the deadline digest only.
- `RFP_RESPONSE_DIGEST_FROM` — From address.
- `RFP_RESPONSE_DIGEST_TO` — comma-separated recipients.
- `RFP_RESPONSE_DIGEST_SUBJECT` — subject prefix. Defaults to `RFP deadline digest`.

This is a digest, not an RFP send. The agent still never claims the questionnaire was submitted.

## Smoke test

1. Set Slack Connect (UID + channel id) and a Google Connect UID. Point the RFP and pack folder ids at Drive folders, or drop an RFP under `rfps/` and a pack under `knowledge-packs/`.
2. In Eve chat: load config, ingest sources, read the materialized files with `read_file`, draft cited sections, ask any SME questions, then write the approved draft with `confirmWrite: true`.
3. Trigger the optional digest in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/rfp-deadline-digest
   ```

4. Nothing is submitted to a portal. Mailbox and Drive writes still require approval.

## Troubleshooting

- **`notConfigured: missingEnv RFP_RESPONSE_SLACK_CONNECT_UID`** — Slack SME routing is required.
- **`notConfigured: missingEnv RFP_RESPONSE_WRITEBACK`** — set a Google Connect UID or a mailbox plus `RFP_RESPONSE_DRAFT_TO`.
- **`Cite gate failed closed`** — a claim had no pack path or Drive id/URL, or the citation was not in the ingested sources.
- **`Open SME questions remain`** — call `ask_sme_questions` and wait before `write_approved_draft`.
- **`confirmWrite must be true`** — `write_approved_draft` refuses until after Eve and SME approval.
- **`Refused portal submit`** — intent was `submit` or `paste`, or a provider tried a portal URL.
- **Slack or email replayed** — the same `rfp-response-drafter-YYYY-MM-DD` key already delivered.
