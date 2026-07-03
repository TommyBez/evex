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
- inspect Vercel projects, deployments, logs, Agent Runs, docs, and protected
  Vercel URLs through the `vercel` MCP connection
- run normal repo commands through Eve's `bash` tool
- run structured `eve info --json`, `eve build`, `eve eval --skip-report`, and
  `eve channels add` operations through `run_eve_cli`
- set up Vercel Connect integrations and deploy through approved
  `run_vercel_cli` calls
- link a Vercel project to retrieve `VERCEL_OIDC_TOKEN` for local AI Gateway
  model calls
- verify protected Vercel previews through `verify_vercel_preview` without
  exposing `VERCEL_AUTOMATION_BYPASS_SECRET`
- smoke-test `/eve/v1/health`, `/eve/v1/session`, streams, and channel routes

The `bash` tool stays available for ordinary shell work. It denies Vercel CLI,
Eve deploy/link, Eve channel setup, and Vercel token commands, so those actions
must use `run_eve_cli` or `run_vercel_cli`. `run_vercel_cli` allows read-only
`whoami` checks without approval. Vercel Connect setup, project linking, preview
deploys, and production deploys require human approval before execution.

## Environment

The registry installs `.env.example` with optional deployment helpers:

```bash
AI_GATEWAY_API_KEY=
VERCEL_TOKEN=
VERCEL_MCP_URL=https://mcp.vercel.com
VERCEL_AUTOMATION_BYPASS_SECRET=
```

On Vercel, the simplest model setup is Vercel AI Gateway OIDC through a linked
project. Outside Vercel, set `AI_GATEWAY_API_KEY` or change `agent/agent.ts` to
use a direct AI SDK provider package and its provider key.

When local testing needs a gateway model credential, the agent should call
`run_vercel_cli` with action `link_project` after approval. That runs
`vercel link` for the target project and then `vercel env pull .env.local`,
which writes a fresh `VERCEL_OIDC_TOKEN` into `.env.local`.

Set `VERCEL_TOKEN` in the app runtime so Eve can create Vercel Sandboxes and
`run_vercel_cli` can broker Vercel CLI authentication through Eve's sandbox
network-policy transform. Tokens are not placed in command text, shell
environment variables inside the sandbox, or generated files.

`VERCEL_TOKEN` also authorizes the Vercel MCP connection. `VERCEL_MCP_URL`
defaults to `https://mcp.vercel.com`; override it only when Vercel publishes or
you operate a different compatible MCP endpoint.

## Vercel MCP

The registry installs `agent/connections/vercel.ts`. Use `connection_search` to
discover Vercel MCP tools for:

- project and deployment inspection
- build logs, runtime logs, and runtime errors
- Agent Runs observability
- Vercel documentation search
- protected preview URL fetching

Use MCP before falling back to the Vercel CLI for read/diagnostic work. Keep
`run_vercel_cli` for local `vercel link`, Vercel Connect setup, and deploy
actions that require local filesystem state or are not exposed by the MCP server.

## Vercel integrations

Use `run_vercel_cli` for Vercel-managed integrations. For Slack, the agent
follows the Eve Slack docs:

1. Add the Slack channel with `run_eve_cli`.
2. Create a Slack Connect client with `run_vercel_cli` action
   `connect_create_slack`.
3. Detach the returned Connect UID from its default destination.
4. Attach that UID to `/eve/v1/slack` with triggers enabled.
5. Deploy and smoke-test Slack delivery.

Vercel Connect setup, project linking, and deploy actions pause for approval
first. `whoami` does not. Deploy actions require the workspace to already be
linked to a Vercel project (`.vercel/project.json`), so a deploy can never
silently create or target a project the user did not confirm.

## Protected preview verification

Use `verify_vercel_preview` to check a deployment's Eve routes. When
`VERCEL_AUTOMATION_BYPASS_SECRET` is set in the app runtime, the tool injects
it at the sandbox firewall as `x-vercel-protection-bypass` and clears that
transform after verification, so previews protected by Vercel Deployment
Protection can be verified without exposing the secret. Without the secret it
verifies unprotected deployments directly.

It verifies:

1. `GET /eve/v1/health`
2. `POST /eve/v1/session` with a smoke-test message
3. `GET /eve/v1/session/<sessionId>/stream`

Do not put `VERCEL_AUTOMATION_BYPASS_SECRET` in command text, generated files, or
sandbox environment variables.

## Local testing before preview

The agent must test generated agents locally before deploying a preview:
install, typecheck, `eve info --json`, `eve build`, evals, and a session or
channel smoke test that exercises the changed agent. The exact order lives in
`agent/skills/eve-agent-delivery/references/testing-sequence.md`, which the
agent follows step by step.

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
  in the app runtime and use `verify_vercel_preview` instead of raw curl.
