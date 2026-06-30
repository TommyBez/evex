---
name: eve-agent-delivery
description: Deliver Eve agents end to end. Use when creating, modifying, testing, or deploying an Eve agent.
---

# Eve agent delivery

Use this procedure whenever the user asks for a new Eve agent, a change to an
existing Eve agent, tests for an agent, or a Vercel deployment.

## Discovery

1. Find the app root and package manager.
2. Read `package.json`, `tsconfig.json`, existing `agent/` files, `evals/`, env
   examples, Vercel config, and README setup notes. **Done when** you can list
   every slot the change touches.
3. Read `node_modules/eve/docs/README.md`, then the pages for those slots.
   **Done when** you have read project layout, `agent.ts`, instructions, tools,
   human-in-the-loop, sandbox credential brokering, channels, evals, CLI, and
   deployment guidance for the slots in scope.
4. Identify required credentials, channel routes, webhook URLs, Vercel Connect
   clients, model routing, route auth, and whether deploy should be preview or
   production.
5. Confirm local runs use a real sandbox backend. This agent uses Vercel Sandbox
   with Node 24 so generated Eve apps can install dependencies, build, and run
   evals.
6. If local model-backed testing needs an AI Gateway credential and neither
   `AI_GATEWAY_API_KEY` nor `VERCEL_OIDC_TOKEN` is present, use `run_vercel_cli`
   action `link_project` after approval.
7. Use the Vercel MCP connection through `connection_search` for Vercel
   inspection, deployment metadata, logs, Agent Runs, docs, and protected URL
   fetches when those tools cover the task.

## Implementation

- Keep the authored surface small. Add only the files needed for the requested
  behavior.
- Put long operating procedures in skills so the base prompt stays readable.
- Put deterministic side effects behind tools. Use approval for external,
  irreversible, user-visible, or production-impacting actions.
- Keep runtime helpers in `agent/lib/`; only skills and sandbox seed files reach
  the sandbox workspace.
- Declare every environment variable in `.env.example` or the app's existing env
  documentation.
- Use `run_eve_cli` for Eve CLI operations. Use `run_vercel_cli` for Vercel
  Connect setup, linking, and deploys. Do not route those through ordinary shell
  commands.
- Prefer the Vercel MCP connection for read-only project/deployment/log work.
  Keep Vercel CLI for local `vercel link` and Connect commands that MCP does
  not expose.
- For channels, see [channel-routes](./references/channel-routes.md).

## Testing

Follow [testing-sequence](./references/testing-sequence.md).

## Vercel deployment

Before deployment, confirm:

- the target Vercel project or team
- preview vs production
- required model credentials, usually Vercel AI Gateway OIDC on Vercel or
  `AI_GATEWAY_API_KEY` elsewhere
- channel credentials and webhook destinations
- route auth is not left as a placeholder for production browser traffic

`run_vercel_cli` uses input-aware approval. `whoami` is read-only and runs
without approval. Before calling Vercel Connect setup, project linking, preview
deploy, or production deploy actions, state the exact operation and target. The
tool brokers app-runtime `VERCEL_TOKEN` through Eve's sandbox network policy, so
do not write Vercel tokens into generated source, command arguments, or sandbox
files.

For Slack setup, see [slack-channel-setup](./references/slack-channel-setup.md).

Use `run_vercel_cli` for preview or production deploys. After deployment, verify
using [channel-routes](./references/channel-routes.md).

## Final report

Return:

- what changed
- tests and commands with pass or fail status
- deployment URL and Vercel target
- live verification evidence
- missing credentials or manual setup that blocked any step
