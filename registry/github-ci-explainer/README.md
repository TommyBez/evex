# GitHub CI Explainer

Explains failed GitHub Actions checks from the log. When a check fails, it
comments what failed and the first useful `file:line` from annotations or the
job log. It comments on the associated pull request when one exists, otherwise
on the commit. It does not push fixes or change the branch.

## How it works

1. Install this agent into an existing Eve app.
2. Deploy the Eve app so GitHub can reach it over HTTPS.
3. Create and install a GitHub App for the repositories you want covered.
4. Point the GitHub App webhook to `/eve/v1/github`.
5. Subscribe the GitHub App to `check_run` events (and grant Actions/Checks
   read).
6. Push a change that fails CI — the agent comments on the PR (or commit).

The GitHub channel listens for completed GitHub Actions check runs with
`conclusion: failure`, fetches annotations and a short log excerpt, then asks
the model to call `explain_ci_failure` once. Publication is a regular issue/PR
timeline comment (or a commit comment when there is no PR).

## GitHub App setup

Create the GitHub App from **GitHub Settings -> Developer settings ->
GitHub Apps -> New GitHub App**.

Use these settings:

- **GitHub App name**: `github-ci-explainer`, or another name that matches
  `GITHUB_APP_SLUG`.
- **Homepage URL**: your deployed Eve app URL.
- **Callback URL**: leave blank.
- **Request user authorization (OAuth) during installation**: disabled.
- **Webhook**: active.
- **Webhook URL**: `https://<your-eve-deployment>/eve/v1/github`.
- **Webhook secret**: a long random value. Save the same value as
  `GITHUB_WEBHOOK_SECRET`.

The webhook URL must be publicly reachable by GitHub. Localhost URLs do not work
unless you expose them through a tunnel.

After creating the app:

1. Copy the **App ID** into `GITHUB_APP_ID`.
2. Generate a private key from the app settings.
3. Copy the private key PEM into `GITHUB_APP_PRIVATE_KEY`.
4. Install the app on the target repositories from **Install App**.

When storing the private key as a single-line environment variable, replace
literal newlines with `\n`. Eve normalizes that form at runtime.

## GitHub permissions

Use the narrowest permissions that support reading checks and posting comments:

- Metadata: read
- Actions: read
- Checks: read
- Contents: read (use read and write only if you need commit comments on
  non-PR SHAs)
- Pull requests: read
- Issues: read and write (PR timeline comments use the Issues API)

Do not grant a permission path used only to publish GitHub Reviews. This agent
never calls the pull request reviews API.

## GitHub events

Subscribe to:

- Check runs

Optional: Check suites are not required for the default `onCheckRun` flow.

## Environment

The registry installs a `.env.example` template. Put real secret values in your
deployment environment.

```bash
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_SLUG=github-ci-explainer
AI_GATEWAY_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

`GITHUB_APP_SLUG` identifies the app; this agent is check-driven and does not
require mention triggers.

Set Vercel Redis/Upstash Marketplace REST credentials for rate limiting and
idempotency. Do not use the read-only token — the agent writes cooldown and
publication claim keys.

Default limits:

- one explanation every 15 minutes per failed check run / head SHA
- 50 explanations per private repository per day
- 20 explanations per public repository per day

Tune with `CI_EXPLAINER_*` variables, or set
`CI_EXPLAINER_RATE_LIMIT_ENABLED=false` for local development.

## Smoke test

1. Open a pull request that fails a GitHub Actions job (for example a typecheck
   error at a known `file:line`).
2. Confirm the `check_run` webhook is delivered to `/eve/v1/github`.
3. Expect one PR comment that names the failed check, includes `path:line`, and
   shows a short log excerpt.
4. Re-deliver the same webhook — expect no comment storm (idempotency claim).

Example failed-check payload shape the channel accepts (abridged):

```json
{
  "action": "completed",
  "check_run": {
    "id": 1,
    "name": "typecheck",
    "status": "completed",
    "conclusion": "failure",
    "head_sha": "abc123",
    "app": { "slug": "github-actions" },
    "pull_requests": [{ "number": 42 }]
  }
}
```

Successful checks (`conclusion: success`) are ignored and must not produce a
comment.

## Troubleshooting

- **HTTP 401 on the webhook**: `GITHUB_WEBHOOK_SECRET` does not match the App
  webhook secret.
- **No comment on failure**: confirm the App is installed on the repo, Events
  include Check runs, Actions/Checks read is granted, and the conclusion is
  `failure` from `github-actions` (not a third-party check app).
- **No commit comment without a PR**: Contents write is required for
  `POST /commits/{sha}/comments`. PR-associated failures only need Issues write.
- **Rate limit replies missing**: Upstash credentials missing or
  `CI_EXPLAINER_RATE_LIMIT_FAILURE_MODE=public_closed` blocking public repos.

## Install

```bash
npx shadcn@latest add @evex/github-ci-explainer
```
