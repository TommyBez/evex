# GitHub Issue Maintainer

Labels GitHub issues, asks for missing repro, and emails a weekly digest.

This eve agent watches newly opened GitHub issues (not pull requests), applies a
small taxonomy label set, asks for missing reproduction details when a report is
thin, and emails a weekly open-issue digest through Resend.

## Install

```bash
npx shadcn@latest add @evex/github-issue-maintainer
```

## How it works

1. Install this agent into an existing Eve app.
2. Deploy the Eve app so GitHub can reach it over HTTPS.
3. Create and install a GitHub App for the repositories you want maintained.
4. Point the GitHub App webhook to `/eve/v1/github`.
5. Subscribe to **Issues** and **Issue comments** (not pull request review write).
6. When an issue opens, the agent labels it and may ask for missing repro details.
7. Every Monday (UTC, configurable) it emails an open-issue digest.

This agent does **not** review pull requests and does **not** publish GitHub PR
reviews. Use `@evex/code-reviewer` for PR review.

## Label taxonomy

Only these labels are applied:

| Label | Meaning |
| --- | --- |
| `bug` | Something is broken or behaves incorrectly |
| `feature` | Request for new capability or behavior |
| `docs` | Documentation gaps or clarification |
| `question` | Guidance without a product change |
| `chore` | Maintenance, CI, dependencies, housekeeping |

Create these labels in the target repository (or allow the GitHub App to create
them on first use).

## Thin-issue detector

For bug-like reports, the agent treats an issue as thin when any of these are
missing:

- steps to reproduce
- expected vs actual behavior
- environment (OS, runtime/browser, package versions)

Thin issues get a short comment asking only for the missing pieces.

## GitHub App setup

Create the GitHub App from **GitHub Settings -> Developer settings ->
GitHub Apps -> New GitHub App**.

Use these settings:

- **GitHub App name**: `github-issue-maintainer`, or another name that matches
  `GITHUB_APP_SLUG`.
- **Homepage URL**: your deployed Eve app URL.
- **Webhook**: active.
- **Webhook URL**: `https://<your-eve-deployment>/eve/v1/github`.
- **Webhook secret**: a long random value. Save the same value as
  `GITHUB_WEBHOOK_SECRET`.

### Permissions

Use the narrowest permissions that support issue triage:

- Metadata: read
- Issues: read/write
- Contents: read (needed for sandbox checkout on triggered turns)

Do **not** grant Pull requests write. This agent must not publish PR reviews.

### Events

Subscribe to:

- Issues
- Issue comments

You do not need Pull request review comments for this agent.

After creating the app:

1. Copy the **App ID** into `GITHUB_APP_ID`.
2. Generate a private key into `GITHUB_APP_PRIVATE_KEY`.
3. Install the app on the target repositories.
4. Copy the installation id into `GITHUB_APP_INSTALLATION_ID` (required for the
   weekly digest API reads).

When storing the private key as a single-line environment variable, replace
literal newlines with `\n`.

## Weekly digest

The digest is a scheduled email (not a PR review). Configure:

```bash
ISSUE_DIGEST_REPO=owner/repo
ISSUE_DIGEST_FROM=digest@yourdomain.com
ISSUE_DIGEST_TO=you@yourdomain.com
ISSUE_DIGEST_SUBJECT="Weekly open-issue digest"
ISSUE_DIGEST_CRON="0 9 * * 1"
RESEND_API_KEY=
GITHUB_APP_INSTALLATION_ID=
```

`ISSUE_DIGEST_TO` accepts a comma-separated list. The schedule defaults to
Mondays at 09:00 UTC. Delivery uses Resend with preview + confirmSend guards and
an idempotency key so retries never duplicate the email.

## Environment

GitHub App credentials:

```bash
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_SLUG=github-issue-maintainer
GITHUB_APP_INSTALLATION_ID=
```

Upstash Redis for rate limiting (stricter on public repos):

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Defaults:

- one triage every 15 minutes per issue
- one triage every 30 minutes per user per issue
- 50 triages per private repository per day
- 15 triages per public repository per day

Tune with `ISSUE_MAINTAINER_*` variables. Set
`ISSUE_MAINTAINER_RATE_LIMIT_ENABLED=false` for local development.

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

## Smoke tests

1. Open a well-formed bug issue — expect a `bug` label and no repro ask.
2. Open a one-line "it doesnt work" issue — expect a label plus a repro ask.
3. Mention `@github-issue-maintainer` on a pull request — expect no triage and no
   PR review.
4. Trigger the digest schedule in dev:

```bash
curl -X POST http://localhost:2000/eve/v1/dev/schedules/weekly-issue-digest
```

## Troubleshooting

- **HTTP 401 on `/eve/v1/github`**: webhook secret mismatch.
- **No triage on new issues**: confirm the Issues event is subscribed and the
  app is installed on the repository.
- **Digest cannot list issues**: set `GITHUB_APP_INSTALLATION_ID` and
  `ISSUE_DIGEST_REPO`, and confirm Issues read permission.
- **Digest email not sent**: confirm `RESEND_API_KEY`, `ISSUE_DIGEST_FROM`, and
  `ISSUE_DIGEST_TO`. The agent previews before sending.
