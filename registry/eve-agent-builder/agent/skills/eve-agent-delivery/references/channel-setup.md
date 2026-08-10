# Channel setup

Do not restate Eve channel configuration here. Read the bundled docs for the
channel you are adding:

| Channel | Route | Eve doc |
| --- | --- | --- |
| Eve session API | `/eve/v1/session` | `node_modules/eve/docs/channels/eve.mdx` |
| GitHub | `/eve/v1/github` | `node_modules/eve/docs/channels/github.mdx` |
| Linear | `/eve/v1/linear` | `node_modules/eve/docs/channels/linear.mdx` |
| Slack | `/eve/v1/slack` | `node_modules/eve/docs/channels/slack.mdx` |

Start with `node_modules/eve/docs/channels/overview.mdx` when choosing a
channel.

Use `run_eve_cli` only for the file-only web scaffold
(`add channel/web --skip-setup`). In Eve 0.31, the GitHub, Linear, and Slack
registry items create their channel files inside their setup flows, so
`--skip-setup` does not scaffold those integrations. Do not run their
interactive setup commands through ordinary shell. Follow the current channel
doc and keep every external setup choice explicit.

## Agent-specific: Slack via Vercel Connect

When the Eve Slack doc's Connect flow applies, use `run_vercel_cli` instead of
raw `vercel connect` commands:

1. `connect_create_slack` — create the Connect client with triggers
2. `connect_detach` — detach from the default destination
3. `connect_attach_slack` — attach to `/eve/v1/slack` with triggers

After `connect_create_slack`, write the documented `agent/channels/slack.ts`
using the returned Connect UID in `connectSlackCredentials("slack/...")`.
Do not put that UID in `.env.example`; that file is only for the portable
`SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` path. Read
`node_modules/eve/docs/channels/slack.mdx` for why `--triggers` and detach/
attach are required.

The official GitHub and Linear channel items can also use Guided Vercel Connect
setup. This builder automates only the Slack Connect operations listed above;
for GitHub or Linear, stop and ask the user to complete the documented Guided
Connect flow or provide the documented portable provider credentials, then
author the channel exactly as the current doc specifies. Do not report the
channel as ready until its file exists, external setup is complete, and its
webhook smoke test passes.

## Completion

**Done when** `eve info --json` lists every added channel at the route from the
Eve doc, and the external webhook (GitHub App, Linear app, or Slack Connect)
points at `https://<deployment><route>`.

Post-deploy health and session checks:
`node_modules/eve/docs/guides/deployment/overview.md` and
`node_modules/eve/docs/guides/deployment/vercel.mdx`. For protected Vercel
previews, use `verify_vercel_preview` instead of raw curl — it brokers
`VERCEL_AUTOMATION_BYPASS_SECRET` and `EVE_ROUTE_AUTHORIZATION` only to exact
HTTPS targets in `EVE_VERIFICATION_ALLOWED_ORIGINS`, runs a smoke session,
validates the health/session/stream status, and clears the credential transform
before returning.
