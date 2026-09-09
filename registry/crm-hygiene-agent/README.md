# CRM Hygiene Agent

Scheduled CRM hygiene via Connect that proposes dedupe, normalize, and enrich batches for human approval before any write.

On a cron tick the agent reads HubSpot, Salesforce, or Pipedrive through Vercel Connect, drafts a cleanup batch, and delivers it to Slack or email. CRM writes run only through `apply_hygiene_writes` after Eve approval and `confirmWrite: true`.

## What it does

1. **Scan on a schedule** — `crm-hygiene-scan` fires on `CRM_HYGIENE_CRON` (default `0 8 * * *` UTC).
2. **Read via Connect** — `scan_crm_records` mints a HubSpot, Salesforce, or Pipedrive token and lists contacts. That path is read-only.
3. **Propose a batch** — `propose_hygiene_batch` drafts dedupe, normalize, and enrich work and appends a `proposed` row to the audit log.
4. **Preview, then deliver** — `preview_hygiene_digest` builds the Slack and email draft. `deliver_hygiene_digest` requires `confirmSend: true` and pauses for Eve approval before Slack or Resend. Delivery is not a CRM write.
5. **Write only after approval** — `apply_hygiene_writes` always pauses. It refuses unless `confirmWrite` is true, mints an `ApprovalGrant`, then performs staged HubSpot, Salesforce, or Pipedrive mutations. There is no auto-merge and no silent overwrite.

## Installation

```bash
npx shadcn@latest add @evex/crm-hygiene-agent
```

## Configuration

Copy `.env.example` into your Eve app environment. Set one CRM provider.

### Schedule and audit

- `CRM_PROVIDER` — `hubspot`, `salesforce`, or `pipedrive`. Empty uses the first complete Connect UID.
- `CRM_HYGIENE_CRON` — 5-field cron (UTC on Vercel). Defaults to `0 8 * * *`.
- `CRM_HYGIENE_MAX_RECORDS` — contacts to read per scan. Defaults to `100`.
- `CRM_HYGIENE_AUDIT_PATH` — append-only JSONL log. Defaults to `.data/crm-hygiene-audit.jsonl`. Use a durable volume in production.

### Optional Slack (Vercel Connect)

Uses the Eve Slack channel (`agent/channels/slack.ts`) with Vercel Connect.
Create a Slack connector and attach triggers to `/eve/v1/slack`
(`vercel connect create slack --triggers`, or `eve add channel/slack`).

- `CRM_HYGIENE_SLACK_CONNECT_UID` — Connect Slack connector UID.
- `CRM_HYGIENE_SLACK_CHANNEL_ID` — Slack channel id for the draft batch.

Leave either empty to skip Slack. `deliver_hygiene_digest` still pauses for Eve
approval before the channel send.

### Email digest (Resend)

- `RESEND_API_KEY` — Resend API key.
- `CRM_HYGIENE_DIGEST_FROM` — sender address verified in Resend.
- `CRM_HYGIENE_DIGEST_TO` — comma-separated recipient addresses.
- `CRM_HYGIENE_DIGEST_SUBJECT` — subject prefix. Defaults to `CRM hygiene batch`.

At least one delivery target (Slack Connect UID + channel id, or a complete email trio) is required before `deliver_hygiene_digest` will send.

### CRM via Vercel Connect

- `CRM_HYGIENE_HUBSPOT_CONNECT_UID` — from `vercel connect create hubspot`.
- `CRM_HYGIENE_SALESFORCE_CONNECT_UID` — from `vercel connect create salesforce`.
- `CRM_HYGIENE_SALESFORCE_INSTANCE_URL` — `https` Salesforce instance, required for Salesforce.
- `CRM_HYGIENE_PIPEDRIVE_CONNECT_UID` — from `vercel connect create pipedrive`.
- `CRM_HYGIENE_PIPEDRIVE_COMPANY_DOMAIN` — optional Pipedrive company domain.

HubSpot write scopes can mutate contacts at the OAuth layer. The runtime write
guard is what keeps scan and propose read-only and requires an `ApprovalGrant`
from `apply_hygiene_writes`.

## Smoke test

1. Set one Connect UID (HubSpot, Salesforce, or Pipedrive) and either Slack Connect (UID + channel id) or Resend + from/to.
2. Trigger the schedule in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/crm-hygiene-scan
   ```

3. The run should call `load_crm_config`, `scan_crm_records`, and `propose_hygiene_batch`. Delivery still requires `confirmSend: true`. CRM writes still require a later `apply_hygiene_writes` with `confirmWrite: true`.

## Troubleshooting

- **`notConfigured: missingEnv CRM_PROVIDER`** — no HubSpot, Salesforce, or Pipedrive Connect UID is set.
- **`notConfirmed: true` on deliver** — `deliver_hygiene_digest` was called without `confirmSend: true`.
- **`notConfirmed: true` on apply** — `apply_hygiene_writes` was called without `confirmWrite: true`. Nothing was written.
- **`Refused CRM write`** — a provider tried a POST, PATCH, PUT, or DELETE without an `ApprovalGrant`.
- **Slack skipped** — `CRM_HYGIENE_SLACK_CONNECT_UID` or `CRM_HYGIENE_SLACK_CHANNEL_ID` is empty. That is optional when email is configured.
