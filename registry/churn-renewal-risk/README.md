# Churn and Renewal Risk

Churn and renewal risk scanner via Connect CRM and Stripe that Slack-digests Healthy/Watch/At-risk movers and drafts HITL CRM save plays without auto-emailing customers.

Weekly cron scores HubSpot or Salesforce accounts in a renewal window against Stripe payment health, posts a Slack digest of movers, and drafts owner save plays as CRM notes behind Eve approval. The cron path never writes the CRM. The agent never emails the customer.

## Install

```bash
npx shadcn@latest add @evex/churn-renewal-risk
```

## What it does

1. **Scan on a weekly schedule** — `churn-renewal-scan` fires on `CHURN_RENEWAL_CRON` (default `0 8 * * 1` UTC).
2. **Read CRM via Connect** — `scan_renewal_accounts` mints a HubSpot or Salesforce token and lists accounts whose renewal date falls in `CHURN_RENEWAL_LOOKAHEAD_DAYS`. That path is read-only.
3. **Load Stripe health** — `load_stripe_health` mints a Stripe Connect token and reads payment signals. Missing or invalid customers fail closed. They are not scored Healthy.
4. **Score movers** — `score_renewal_risk` buckets Healthy, Watch, and At-risk, compares against the last audit snapshot, and appends a `scored` row.
5. **Preview, then Slack** — `preview_renewal_digest` builds the movers digest. `deliver_renewal_digest` requires `confirmSend: true` and pauses for Eve approval before Slack. Delivery is not a CRM write and is not a customer email.
6. **Write a note only after approval** — `draft_save_play` always pauses. It refuses unless `confirmWrite` is true, mints an `ApprovalGrant`, then writes a HubSpot company note or Salesforce task. There is no auto-email.

## Surfaces

- **Schedule** `churn-renewal-scan` on `CHURN_RENEWAL_CRON`.
- **Slack** through the Eve Slack Connect channel when `CHURN_RENEWAL_SLACK_CONNECT_UID` and `CHURN_RENEWAL_SLACK_CHANNEL_ID` are set.
- **Eve chat** for an on-demand scan or an approved save-play note.

## Environment

Copy `.env.example` into your Eve app environment. Set one CRM provider, Stripe Connect, and Slack.

### Schedule and audit

- `CRM_PROVIDER` — `hubspot` or `salesforce`. Empty uses the first complete Connect UID.
- `CHURN_RENEWAL_CRON` — 5-field cron (UTC on Vercel). Defaults to `0 8 * * 1`.
- `CHURN_RENEWAL_LOOKAHEAD_DAYS` — renewal window in days. Defaults to `90`.
- `CHURN_RENEWAL_MAX_ACCOUNTS` — accounts to read per scan. Defaults to `100`.
- `CHURN_RENEWAL_AUDIT_PATH` — append-only JSONL log. Defaults to `.data/churn-renewal-audit.jsonl`. Use a durable volume in production. Rows store identifiers and buckets only — not CRM or Stripe values.
- `CHURN_RENEWAL_AUDIT_RETENTION_DAYS` — days to keep audit rows. Defaults to `90`.

### Slack

Create a Slack connector (`vercel connect create slack --triggers`, or `eve add channel/slack`).

- `CHURN_RENEWAL_SLACK_CONNECT_UID`
- `CHURN_RENEWAL_SLACK_CHANNEL_ID`

### CRM via Vercel Connect

Tokens come from Connect `getToken` (`subject: app`), not a refresh-token pair. Writes still require `draft_save_play` after Eve approval.

- `CHURN_RENEWAL_HUBSPOT_CONNECT_UID` — from `vercel connect create hubspot`.
- `CHURN_RENEWAL_HUBSPOT_RENEWAL_PROPERTY` — company date property. Defaults to `renewal_date`.
- `CHURN_RENEWAL_HUBSPOT_STRIPE_CUSTOMER_PROPERTY` — defaults to `stripe_customer_id`.
- `CHURN_RENEWAL_SALESFORCE_CONNECT_UID` — from `vercel connect create salesforce`.
- `CHURN_RENEWAL_SALESFORCE_INSTANCE_URL` — HTTPS instance URL.
- `CHURN_RENEWAL_SALESFORCE_RENEWAL_FIELD` — defaults to `Renewal_Date__c`.
- `CHURN_RENEWAL_SALESFORCE_STRIPE_CUSTOMER_FIELD` — defaults to `Stripe_Customer_Id__c`.

### Stripe via Vercel Connect

- `CHURN_RENEWAL_STRIPE_CONNECT_UID` — from `vercel connect create stripe`. Scope is `read_only`. Health lookups never write Stripe.

## What it never does

There is no email tool. SMTP ports and `/send` / `sendMail` URLs are refused in code. Cron never calls `draft_save_play`. CRM notes stay behind Eve approval and `confirmWrite: true`. PostHog and Mixpanel are not required.

This SKU is not CRM hygiene dedupe and not invoice-chase AR. It scores renewal-dated accounts against Stripe health.

## Smoke tests

1. Set HubSpot or Salesforce Connect, Stripe Connect, and Slack Connect (UID + channel id).
2. Trigger the schedule in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/churn-renewal-scan
   ```

3. The run should call `load_renewal_config`, `scan_renewal_accounts`, `load_stripe_health`, and `score_renewal_risk`. Delivery still requires `confirmSend: true`. CRM notes still require a later `draft_save_play` with `confirmWrite: true`.
4. Confirm `draft_save_play` returns `written: false` and `emailedCustomer: false` until you approve.

## Troubleshooting

- **notConfigured** — set one CRM Connect UID, `CHURN_RENEWAL_STRIPE_CONNECT_UID`, and Slack UID plus channel id.
- **failClosed** — the Stripe customer id was missing, invalid, or the Stripe lookup failed. The account is not scored Healthy.
- **notConfirmed on deliver** — `deliver_renewal_digest` was called without `confirmSend: true`.
- **notConfirmed on draft** — `draft_save_play` was called without `confirmWrite: true`. Nothing was written.
- **Slack replayed** — the same `churn-renewal-risk-YYYY-MM-DD` key already posted.
- **Refused CRM write** — a provider tried a POST, PATCH, PUT, or DELETE without an `ApprovalGrant`.
