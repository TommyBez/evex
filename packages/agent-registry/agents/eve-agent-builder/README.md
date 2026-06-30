# Eve Agent Builder

Build, test, and deploy Eve agents from an existing Eve app. This agent works
through whatever channel your app already exposes: web chat, the Eve session
API, Slack, GitHub, or another channel.

It reads the repository and the local Eve docs, writes the smallest Eve surface
needed for the request, runs local Eve checks, installs Vercel-managed
integrations after approval, deploys to Vercel after approval, and verifies the
live routes.

The agent pins Eve's Vercel Sandbox backend with Node 24. That gives local runs a
real Node environment, so generated agents can install dependencies, build, and
run evals before any preview deploy.

## Install

Run this in an existing Eve app:

```bash
npx shadcn@latest add @evex/eve-agent-builder
```

This package does not add a channel. Use your existing app UI or channel. If the
app has no interactive surface yet, add one with Eve first, for example a web or
Slack channel.

## What it can do

- create a new Eve agent in an existing project
- add instructions, skills, tools, channels, schedules, subagents, and evals
- load the official Eve skill installed from `npx skills add
  https://github.com/vercel/eve --skill eve`
- read the local Eve docs before using framework APIs
- run normal repo commands through Eve's `bash` tool
- run structured `eve info --json`, `eve build`, `eve eval --skip-report`, and
  `eve channels add` operations through `run_eve_cli`
- set up Vercel Connect integrations and deploy through approved
  `run_vercel_cli` calls
- link a Vercel project to retrieve `VERCEL_OIDC_TOKEN` for local AI Gateway
  model calls
- smoke-test `/eve/v1/health`, `/eve/v1/session`, streams, and channel routes

The `bash` tool stays available for ordinary shell work. It denies Vercel CLI,
Eve deploy/link, Eve channel setup, and Vercel token commands, so those actions
must use `run_eve_cli` or `run_vercel_cli`. Vercel Connect setup, project
linking, preview deploys, and production deploys run through `run_vercel_cli`,
which always requires human approval before execution.

## Environment

The registry installs `.env.example` with optional deployment helpers:

```bash
AI_GATEWAY_API_KEY=
VERCEL_TOKEN=
VERCEL_AUTOMATION_BYPASS_SECRET=
```

On Vercel, the simplest model setup is Vercel AI Gateway OIDC through a linked
project. Outside Vercel, set `AI_GATEWAY_API_KEY` or change `agent/agent.ts` to
use a direct AI SDK provider package and its provider key.

When local testing needs a gateway model credential, the agent should call
`run_vercel_cli` with action `link_project` after approval. That runs
`vercel link` for the target project and lets the Vercel CLI create `.env.local`
with a fresh `VERCEL_OIDC_TOKEN`.

Set `VERCEL_TOKEN` in the app runtime so Eve can create Vercel Sandboxes and
`run_vercel_cli` can broker Vercel CLI authentication through Eve's sandbox
network-policy transform. Tokens are not placed in command text, shell
environment variables inside the sandbox, or generated files.

## Vercel integrations

Use `run_vercel_cli` for Vercel-managed integrations. For Slack, the agent
follows the Eve Slack docs:

1. Add the Slack channel with `run_eve_cli`.
2. Create a Slack Connect client with `run_vercel_cli` action
   `connect_create_slack`.
3. Detach the returned Connect UID from its default destination.
4. Attach that UID to `/eve/v1/slack` with triggers enabled.
5. Deploy and smoke-test Slack delivery.

Every Vercel Connect or deploy action pauses for approval first.

## Local testing before preview

The agent must test generated agents locally before deploying a preview:

1. install dependencies
2. link the Vercel project with `run_vercel_cli` action `link_project` when a
   local `VERCEL_OIDC_TOKEN` is needed
3. run typecheck or the repo check
4. run `eve info --json`
5. run `eve build`
6. run `eve eval --skip-report` when evals exist
7. run a local session or channel smoke test that exercises the changed agent

If Vercel Sandbox cannot start, local implementation testing is blocked. Do not
treat a no-binaries fallback sandbox as complete.

## Example prompts

Create and test a new agent:

```md
Create an Eve agent that answers customer onboarding questions from our docs.
Use the existing web channel, add evals for three common questions, and run the
local checks before you stop.
```

Deploy after review:

```md
Deploy the onboarding agent to a Vercel preview, then verify the health route
and run one smoke-test session against the preview URL.
```

Production deploys should be explicit:

```md
Deploy the tested onboarding agent to Vercel production. The target project is
acme-onboarding-agent.
```

## Smoke tests

After a deploy, the agent should verify the live app:

```bash
curl https://<deployment>/eve/v1/health
curl -X POST https://<deployment>/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"Smoke test the new agent."}'
```

If the app uses a channel, test that route too. Common routes:

- GitHub: `/eve/v1/github`
- Slack: `/eve/v1/slack`
- Eve session API: `/eve/v1/session`

## Troubleshooting

- `eve info` does not show a file: move it into the correct `agent/` slot and
  rerun `eve info --json`.
- `eve build` fails on docs or discovery: read `.eve/discovery/diagnostics.json`
  and fix the authored file path or config.
- Vercel Sandbox or Vercel CLI reports unauthenticated: set `VERCEL_TOKEN` in
  the app runtime. Do not pass it as a command argument or sandbox env var.
- Model calls fail locally: set `AI_GATEWAY_API_KEY` or use a direct provider
  model with the matching provider key.
- Preview smoke tests return auth HTML: set `VERCEL_AUTOMATION_BYPASS_SECRET`
  before testing protected previews.
