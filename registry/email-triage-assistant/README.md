# Email Triage Assistant

Inbox triage that classifies threads and writes draft replies without sending.

The agent reads Gmail, Outlook, or IMAP on a cron schedule or a signed push
webhook, sorts threads into triage buckets, matches the Sent-folder voice,
and leaves replies in Drafts. You send them yourself.

## Install

```bash
npx shadcn@latest add @evex/email-triage-assistant
```

## Surfaces

- **Schedule** `inbox-triage` on `EMAIL_TRIAGE_CRON` (default `0 */2 * * *` UTC).
- **Push** `POST /inbox/push` with `Authorization: Bearer <EMAIL_PUSH_WEBHOOK_SECRET>`
  or `X-Webhook-Secret`. Gmail watch, Microsoft Graph subscriptions, and a
  generic `{ "reason": "push" }` body all start a mailbox run.
- Graph subscription handshake: `GET` or `POST /inbox/push?validationToken=...`
  echoes the token. That route is public only for the token echo; every other
  POST requires the secret.

The Eve app must be reachable over HTTPS for provider push. Localhost URLs
do not receive Gmail or Graph notifications.

## What it never does

There is no send tool. Gmail calls stop at `drafts.create`. Graph uses
`createReply` and a PATCH on the draft. IMAP uses `APPEND` to
`IMAP_DRAFTS_MAILBOX`. SMTP ports and `/send` / `sendMail` URLs are refused
in code.

## Environment

Copy `.env.example` into the Eve app environment. Set one mailbox provider.

### Schedule, buckets, and push

- `EMAIL_PROVIDER` — `gmail`, `outlook`, or `imap`. Empty uses the first complete credential set.
- `EMAIL_TRIAGE_CRON` — 5-field cron. Defaults to `0 */2 * * *`.
- `TRIAGE_BUCKETS` — comma-separated slugs. Defaults to `needs-reply,fyi,waiting,urgent,newsletter,no-reply`.
- `EMAIL_MAX_THREADS` / `EMAIL_SENT_SAMPLE_SIZE` — list and Sent-sample sizes.
- `EMAIL_PUSH_WEBHOOK_SECRET` — required for `POST /inbox/push`.

### Gmail OAuth

Read inbox plus write drafts only. Consent
`gmail.readonly` and `gmail.compose`. The agent never calls `messages.send`
or `drafts.send`.

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_USER` — optional From header on drafts

### Microsoft Graph

Drafts only. Consent `Mail.Read`, `Mail.ReadWrite`, and `offline_access`.
The agent never calls `sendMail`.

- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_REFRESH_TOKEN`

### IMAP

APPEND to Drafts. No SMTP.

- `IMAP_HOST` / `IMAP_PORT` (default `993`)
- `IMAP_USER` / `IMAP_PASSWORD`
- `IMAP_DRAFTS_MAILBOX` (default `Drafts`)
- `IMAP_INBOX_MAILBOX` (default `INBOX`)
- `IMAP_SENT_MAILBOX` (default `Sent`)

### Optional Slack

- `EMAIL_TRIAGE_SLACK_WEBHOOK_URL` — incoming webhook for a "drafts ready"
  queue note. Leave empty to skip.

### Model

- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key or OIDC.

## Smoke test

1. Set one provider's credentials and `AI_GATEWAY_API_KEY`.
2. Trigger the schedule in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/inbox-triage
   ```

3. Or POST a signed push:

   ```bash
   curl -X POST http://localhost:3000/inbox/push \
     -H "Authorization: Bearer $EMAIL_PUSH_WEBHOOK_SECRET" \
     -H "content-type: application/json" \
     -d '{"reason":"push"}'
   ```

4. Confirm new messages sit in Drafts and nothing left the mailbox.

## Troubleshooting

- **`notConfigured: missingEnv EMAIL_PROVIDER`** — no complete Gmail, Graph, or IMAP set.
- **HTTP 401 on `/inbox/push`** — secret missing or mismatched.
- **IMAP APPEND failed** — `IMAP_DRAFTS_MAILBOX` is not the provider's Drafts folder (`[Gmail]/Drafts` on some hosts).
- **Slack skipped** — `EMAIL_TRIAGE_SLACK_WEBHOOK_URL` is empty. That is optional.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
```
