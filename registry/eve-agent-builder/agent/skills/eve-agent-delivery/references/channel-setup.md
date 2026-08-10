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

Scaffold channel files with `run_eve_cli` (`channels add`), not ordinary shell.

## Agent-specific: Slack via Vercel Connect

When the Eve Slack doc's Connect flow applies, use `run_vercel_cli` instead of
raw `vercel connect` commands:

1. `connect_create_slack` — create the Connect client with triggers
2. `connect_detach` — detach from the default destination
3. `connect_attach_slack` — attach to `/eve/v1/slack` with triggers

Store the returned Connect UID in `.env.example`. Read
`node_modules/eve/docs/channels/slack.mdx` for why `--triggers` and detach/
attach are required.

GitHub and Linear channel setup are configured in their respective platforms and
env vars — see the Eve channel docs above, not Vercel Connect.

## Completion

**Done when** `eve info --json` lists every added channel at the route from the
Eve doc, and the external webhook (GitHub App, Linear app, or Slack Connect)
points at `https://<deployment><route>`.

Post-deploy health and session checks: `node_modules/eve/docs/guides/deployment.md`
(section 9). For protected Vercel previews, use `verify_vercel_preview` instead
of raw curl — it brokers `VERCEL_AUTOMATION_BYPASS_SECRET`, runs a smoke session,
and clears the bypass transform before returning.
