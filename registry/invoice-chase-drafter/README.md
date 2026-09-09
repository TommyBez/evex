# Invoice Chase Drafter

Weekday AR chase via Connect that drafts mailbox reminders from QuickBooks or Xero and posts an idempotent Slack digest after a paid re-check.

On a weekday cron the agent reads unpaid invoices through Custom OAuth Connect, ages them into buckets, writes reminder emails into Drafts, and posts a finance digest to Slack. It never sends mail. A paid re-check drops settled invoices before the digest, and the date idempotency key stops a retry from double-posting Slack.

## What it does

1. **Chase on weekdays** — `chase-open-invoices` fires on `INVOICE_CHASE_CRON` (default `0 8 * * 1-5` UTC).
2. **Read AR via Connect** — `list_open_invoices` mints a QuickBooks or Xero Custom OAuth token and lists unpaid invoices with aging buckets. That path is GET-only.
3. **Paid re-check** — `recheck_paid_invoices` re-reads each invoice and drops rows that are now paid.
4. **Drafts only** — `create_reminder_draft` writes Gmail `drafts.create` or Graph Drafts after Eve approval. It always returns `sent: false`. There is no SMTP or send API.
5. **Idempotent Slack digest** — `preview_ar_digest` builds the date key. `deliver_ar_digest` requires `confirmSend: true` and pauses for Eve approval before the Eve Slack Connect channel. The same date key is not posted twice.

## Installation

```bash
npx shadcn@latest add @evex/invoice-chase-drafter
```

## Configuration

Copy `.env.example` into your Eve app environment. Set one AR provider, one mailbox, and Slack Connect.

### Schedule and store

- `INVOICE_CHASE_AR_PROVIDER` — `quickbooks` or `xero`. Empty uses the first complete Custom OAuth Connect UID.
- `INVOICE_CHASE_CRON` — 5-field cron (UTC on Vercel). Defaults to `0 8 * * 1-5`.
- `INVOICE_CHASE_MAX_INVOICES` — invoices to read per run. Defaults to `100`.
- `INVOICE_CHASE_STORE_PATH` — JSON file for digest delivery claims. Defaults to `.data/invoice-chase-store.json`. Use a durable volume in production.

### Slack (Vercel Connect)

Uses the Eve Slack channel (`agent/channels/slack.ts`) with Vercel Connect.
Create a Slack connector and attach triggers to `/eve/v1/slack`
(`vercel connect create slack --triggers`, or `eve add channel/slack`).

- `INVOICE_CHASE_SLACK_CONNECT_UID` — Connect Slack connector UID.
- `INVOICE_CHASE_SLACK_CHANNEL_ID` — Slack channel id for the finance digest.

Both are required before `deliver_ar_digest` will post. The tool still pauses
for Eve approval, and the date key keeps a replay from posting twice.

### QuickBooks or Xero via Custom OAuth Connect

- `INVOICE_CHASE_QUICKBOOKS_CONNECT_UID` — from a custom OAuth connector
  (`vercel connect create`) pointed at Intuit authorize and token URLs, scope
  `com.intuit.quickbooks.accounting`.
- `INVOICE_CHASE_QUICKBOOKS_REALM_ID` — QuickBooks company id.
- `INVOICE_CHASE_QUICKBOOKS_ENVIRONMENT` — `production` or `sandbox`.
- `INVOICE_CHASE_XERO_CONNECT_UID` — custom OAuth connector for Xero, scopes
  `accounting.transactions.read accounting.contacts.read offline_access`.
- `INVOICE_CHASE_XERO_TENANT_ID` — Xero tenant id.

### Mailbox via Vercel Connect (Drafts only)

- `INVOICE_CHASE_MAILBOX_PROVIDER` — `gmail` or `outlook`. Empty uses the first complete mailbox Connect UID.
- `INVOICE_CHASE_GOOGLE_CONNECT_UID` — from `vercel connect create google`.
- `INVOICE_CHASE_GMAIL_USER` — optional From address written onto Gmail drafts.
- `INVOICE_CHASE_MICROSOFT_CONNECT_UID` — from `vercel connect create microsoft`.

Gmail uses `gmail.compose`. Graph uses `Mail.ReadWrite`. The runtime send
guard refuses `messages.send`, `drafts.send`, `sendMail`, and SMTP.

## Smoke test

1. Set one Custom OAuth Connect UID (QuickBooks or Xero), one mailbox Connect UID, and Slack Connect (UID + channel id).
2. Trigger the schedule in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/chase-open-invoices
   ```

3. The run should call `load_chase_config`, `list_open_invoices`, and `recheck_paid_invoices`. Drafts still require approval. Slack still requires `confirmSend: true`. Nothing is emailed.

## Troubleshooting

- **`notConfigured: missingEnv INVOICE_CHASE_AR_PROVIDER`** — no QuickBooks or Xero Custom OAuth Connect UID is set.
- **`notConfirmed: true` on deliver** — `deliver_ar_digest` was called without `confirmSend: true`.
- **`sent: false` on create_reminder_draft** — send intent was refused, or Drafts were written and `sent` is always false.
- **`Refused ... never sends mail`** — a provider tried `messages.send`, `drafts.send`, or `sendMail`.
- **Slack replayed** — the same `invoice-chase-drafter-YYYY-MM-DD` key already posted. The store skipped a second post.
