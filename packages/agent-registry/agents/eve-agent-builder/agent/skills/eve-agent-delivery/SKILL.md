---
description: Use when creating, modifying, testing, or deploying an Eve agent.
---

# Eve agent delivery

Use this procedure whenever the user asks for a new Eve agent, a change to an
existing Eve agent, tests for an agent, or a Vercel deployment.

## Discovery
1. Find the app root and package manager.
2. Read `package.json`, `tsconfig.json`, existing `agent/` files, `evals/`, env
   examples, Vercel config, and README setup notes.
3. Read `node_modules/eve/docs/README.md`, then the pages for the slots you will
   touch. For most tasks, read project layout, `agent.ts`, instructions, tools,
   human-in-the-loop, sandbox credential brokering, channels, evals, CLI, and
   deployment.
4. Identify required credentials, channel routes, webhook URLs, Vercel Connect
   clients, model routing, route auth, and whether deploy should be preview or
   production.
5. Confirm local runs use a real sandbox backend. This agent is configured for
   Vercel Sandbox with Node 24 so generated Eve apps can install dependencies,
   build, and run evals.
6. If local model-backed testing needs an AI Gateway credential and neither
   `AI_GATEWAY_API_KEY` nor `VERCEL_OIDC_TOKEN` is present, use `run_vercel_cli`
   action `link_project` after approval. This runs `vercel link` for the target
   project and retrieves a fresh `VERCEL_OIDC_TOKEN` into `.env.local`.

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
- For channels, document the route and setup:
  - GitHub: `/eve/v1/github`
  - Slack: `/eve/v1/slack`
  - Eve session API: `/eve/v1/session`

## Testing
Run the narrowest checks that prove the changed agent works, then broaden before
deployment.

Preferred local sequence:
1. install dependencies
2. run `run_vercel_cli` action `link_project` when local model calls need
   `VERCEL_OIDC_TOKEN`
3. typecheck or repo check
4. `eve info --json`
5. `eve build`
6. `eve eval --skip-report` when evals exist
7. local session or channel smoke test that exercises the created agent
8. channel smoke test when the channel is part of the change

When a check fails, inspect the artifact or log, fix the root cause, and rerun
the failed check. Do not treat a build-only pass as proof of behavior when an
eval or channel smoke test is available.
Do not deploy to preview until these local checks pass.

## Vercel deployment
Before deployment, confirm:
- the target Vercel project or team
- preview vs production
- required model credentials, usually Vercel AI Gateway OIDC on Vercel or
  `AI_GATEWAY_API_KEY` elsewhere
- channel credentials and webhook destinations
- route auth is not left as a placeholder for production browser traffic

`run_vercel_cli` is approval-gated. Before calling it, state the exact operation
and target. It brokers app-runtime `VERCEL_TOKEN` through Eve's sandbox network
policy, so do not write Vercel tokens into generated source, command arguments,
or sandbox files.

When a Slack channel is needed, use the Eve Slack docs workflow:
1. Add the Slack channel and `@vercel/connect` dependency.
2. Call `run_vercel_cli` with `connect_create_slack`.
3. Detach the returned Connect UID from the default destination.
4. Attach the Connect UID to `/eve/v1/slack` with triggers enabled.
5. Deploy and verify Slack events reach the route.

Use `run_vercel_cli` for preview or production deploys. After deployment, verify:

```bash
curl https://<deployment>/eve/v1/health
curl -X POST https://<deployment>/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"Smoke test the new agent."}'
```

If preview protection is enabled, configure `VERCEL_AUTOMATION_BYPASS_SECRET`
locally before remote smoke tests.

## Final report
Return:
- what changed
- tests and commands with pass or fail status
- deployment URL and Vercel target
- live verification evidence
- missing credentials or manual setup that blocked any step
