# Code Reviewer

Review GitHub pull requests from a native GitHub App channel. Mention
`@code-reviewer` on a pull request and it publishes a GitHub review with inline
comments for concrete findings. Small, local fixes may include GitHub suggestion
blocks that the PR author can apply manually.

The agent reviews changed behavior rather than style. It looks for bugs,
regressions, security issues, rollout risk, and materially missing tests.

## How it works

1. Install this agent into an existing Eve app.
2. Deploy the Eve app so GitHub can reach it over HTTPS.
3. Create and install a GitHub App for the repositories you want reviewed.
4. Point the GitHub App webhook to `/eve/v1/github`.
5. Subscribe the GitHub App to PR comment events.
6. Comment on a pull request:

```md
@code-reviewer review this
```

The GitHub channel injects PR metadata and diff context, checks out the
repository into the Eve sandbox, and lets the agent inspect relevant files. The
agent does not push commits, open branches, or modify the pull request. It only
publishes review comments and optional suggestion blocks.

## GitHub App setup

Create the GitHub App from **GitHub Settings -> Developer settings ->
GitHub Apps -> New GitHub App**.

Use these settings:

- **GitHub App name**: `code-reviewer`, or another name that matches
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

Use the narrowest permissions that support review comments:

- Metadata: read
- Contents: read
- Pull requests: read/write
- Issues: read/write

The issues permission is needed for PR timeline comments and fallback replies.

## GitHub events

Subscribe only to the events this agent consumes:

- Issue comments
- Pull request review comments

The first event lets users mention `@code-reviewer` from the PR conversation
timeline. The second lets users mention it from a code review thread in the
Files changed view.

You do not need the broader Issues or Pull requests events for the default
mention-driven workflow.

## Environment

The registry installs a `.env.example` template. Put real secret values in your
deployment environment.

Set the GitHub App credentials:

```bash
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_SLUG=code-reviewer
```

`GITHUB_APP_SLUG` must match the mention users type in GitHub. With the default
value above, the trigger is:

```md
@code-reviewer review this
```

Set Vercel Redis/Upstash Marketplace REST credentials for rate limiting:

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Do not use the read-only token for this agent. Rate limiting writes cooldown and
review publication keys. `KV_URL` and `REDIS_URL` are Redis protocol URLs and
are not used by this REST client.

The default rate limits are intentionally stricter on public repositories:

- one review every 15 minutes per PR
- one review every 30 minutes per user per PR
- 25 reviews per private repository per day
- 10 reviews per public repository per day
- one cooldown reply every 15 minutes per PR

For local development only, you can disable rate limiting:

```bash
CODE_REVIEWER_RATE_LIMIT_ENABLED=false
```

Production public deployments should keep rate limiting enabled. If Upstash is
unavailable, the default failure mode blocks public repositories and allows
private repositories.

## Deployment checklist

Before testing from GitHub, confirm:

- The Eve app is deployed and has a POST webhook route at
  `https://<your-eve-deployment>/eve/v1/github`.
- The deployment has GitHub App credentials, Upstash Redis REST credentials,
  and a model credential such as Vercel AI Gateway OIDC or
  `AI_GATEWAY_API_KEY`.
- The GitHub App is installed on the repository that contains the pull request.
- The app has **Contents: read**, **Issues: read/write**, and **Pull requests:
  read/write** on that repository.
- The webhook is active and subscribed to **Issue comments** and **Pull request
  review comments**.

GitHub sends a `ping` webhook when you create or update the app. A successful
delivery should return HTTP 200. Then open a pull request and comment:

```md
@code-reviewer review this
```

Expected behavior:

- GitHub accepts the webhook delivery.
- The agent adds an `eyes` reaction unless progress reactions are disabled.
- The agent posts a GitHub pull request review with inline comments when it
  finds concrete issues.
- If no inline finding is warranted, it posts a short PR timeline summary.

Common setup failures:

- HTTP 401 from `/eve/v1/github`: `GITHUB_WEBHOOK_SECRET` does not match the
  GitHub App webhook secret.
- No response to a mention: the app is not subscribed to the comment event, the
  mention does not match `GITHUB_APP_SLUG`, or the app is not installed on that
  repository.
- GitHub API 403: the app installation is missing repository access or one of
  the required write permissions.
- Public repository reviews are blocked: Upstash is unavailable and the default
  failure mode is `public_closed`.

## Development

```bash
pnpm install
pnpm dev
```

Run `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.
Use `pnpm eval -- --skip-report` for lightweight agent behavior checks.
