# Inbound Lead Qualifier

Inbound lead qualifier via signed intake or Connect CRM/Typeform that scores ICP fit, drafts approved CRM notes, and Slack-notifies hot leads only.

The agent takes a signed form or CRM webhook, an optional Typeform Connect poll, or a CRM scan since the last cursor. It enriches and scores ICP fit, drafts a CRM note behind Eve approval, and Slack-pings only the hot ones. It never emails the lead.

## Install

```bash
npx shadcn@latest add @evex/inbound-lead-qualifier
```

## Surfaces

- **Schedule** `inbound-lead-scan` on `INBOUND_LEAD_CRON` (default `0 * * * *` UTC). This is the primary intake when signed push is unset, and Typeform or CRM catch-up when push is set.
- **Push** `POST /leads/push`. HMAC signatures use `X-Hub-Signature-256`, `X-Webhook-Signature`, or `Typeform-Signature` over the raw body with `INBOUND_LEAD_PUSH_WEBHOOK_SECRET`. Generic proxies may send `Authorization: Bearer <secret>` or `X-Webhook-Secret`.
- **Slack** through the Eve Slack Connect channel when `INBOUND_LEAD_SLACK_CONNECT_UID` and `INBOUND_LEAD_SLACK_CHANNEL_ID` are set. Connect trigger-forward is Slack-only, so form intake stays on signed HTTP.

The Eve app must be reachable over HTTPS for form and CRM webhooks.

## What it never does

There is no email tool. SMTP ports and `/send` / `sendMail` URLs are refused in code. Slack notify is hot-only. CRM contact and note writes stay behind `draft_crm_note` after Eve approval and `confirmWrite: true`.

## Environment

Copy `.env.example` into the Eve app environment. Set at least one intake path: HMAC secret, Typeform Connect, or a CRM Connect UID.

### Schedule, cursor, and push

- `INBOUND_LEAD_CRON` — 5-field cron. Defaults to `0 * * * *`.
- `INBOUND_LEAD_CURSOR_PATH` — JSON cursor of last-seen ids. Defaults to `.data/inbound-lead-cursor.json`.
- `INBOUND_LEAD_PUSH_WEBHOOK_SECRET` — HMAC secret for `POST /leads/push`.

### Slack

Create a Slack connector (`vercel connect create slack --triggers`, or `eve add channel/slack`).

- `INBOUND_LEAD_SLACK_CONNECT_UID`
- `INBOUND_LEAD_SLACK_CHANNEL_ID`

### CRM via Vercel Connect

Tokens come from Connect `getToken` (`subject: app`), not a refresh-token pair. Writes still require `draft_crm_note` after Eve approval.

- `CRM_PROVIDER` — `hubspot`, `salesforce`, or `pipedrive`. Empty uses the first complete Connect UID.
- `INBOUND_LEAD_HUBSPOT_CONNECT_UID` — from `vercel connect create hubspot`.
- `INBOUND_LEAD_SALESFORCE_CONNECT_UID` — from `vercel connect create salesforce`.
- `INBOUND_LEAD_SALESFORCE_INSTANCE_URL` — HTTPS instance URL.
- `INBOUND_LEAD_PIPEDRIVE_CONNECT_UID` — from `vercel connect create pipedrive`.
- `INBOUND_LEAD_PIPEDRIVE_COMPANY_DOMAIN` — optional company domain.

### Typeform via Vercel Connect

Optional poll of completed responses newer than the cursor.

- `INBOUND_LEAD_TYPEFORM_CONNECT_UID` — from `vercel connect create typeform`.
- `INBOUND_LEAD_TYPEFORM_FORM_ID`

### ICP

- `INBOUND_LEAD_ICP_DOMAINS` / `INBOUND_LEAD_ICP_TITLES` / `INBOUND_LEAD_ICP_KEYWORDS`
- `INBOUND_LEAD_HOT_THRESHOLD` — default `70`.
- `INBOUND_LEAD_REQUIRE_WORK_EMAIL` — default `true`. Enrichment fail-closes on free or disposable domains.

## Smoke tests

1. POST a signed JSON body to `/leads/push` with `X-Hub-Signature-256: sha256=<hex>` over the raw body.
2. POST `/eve/v1/dev/schedules/inbound-lead-scan` while iterating.
3. Confirm `draft_crm_note` returns `written: false` until you approve with `confirmWrite: true`.
4. Confirm `notify_slack_hot_lead` skips a warm or cold score.

## Troubleshooting

- **401 on `/leads/push`** — the HMAC hex or base64 digest of the raw body does not match `INBOUND_LEAD_PUSH_WEBHOOK_SECRET`.
- **notConfigured** — set a push secret, Typeform Connect plus form id, or one CRM Connect UID.
- **failClosed** — the email was missing, invalid, or a free domain while work email is required. The lead is not scored hot.
- **written false** — `confirmWrite` was not true after Eve approval. No CRM write ran.
