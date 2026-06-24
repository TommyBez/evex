# Linear Operations Agent

An Eve agent for Linear operations across Linear, Slack, and scheduled runs.

Linear is the source of truth. Slack is used for intake, coordination, notification, and scheduled report delivery. Scheduled initiative updates are written directly to Linear for explicitly configured initiatives.

## What You Are Setting Up

This agent has three different integration points. They are intentionally separate:

| Part | File | Runtime route or server | Credentials |
| --- | --- | --- | --- |
| Linear channel | `agent/channels/linear.ts` | `POST /eve/v1/linear` | `LINEAR_AGENT_ACCESS_TOKEN`, `LINEAR_WEBHOOK_SECRET` |
| Slack channel | `agent/channels/slack.ts` | `POST /eve/v1/slack` | Vercel Connect Slack UID in `SLACK_CONNECT_UID` |
| Linear MCP connection | `agent/connections/linear.ts` | `https://mcp.linear.app/mcp` | Vercel Connect Linear OAuth UID in `LINEAR_CONNECT_UID` |

The Linear channel is how users mention or delegate work to the agent inside Linear. The Slack channel is how users mention or DM the agent in Slack. The Linear MCP connection is how the agent reads and writes Linear data from any surface, including Slack and schedules.

Do not replace the Linear MCP connection with custom Linear SDK tools for this agent. The connection exposes the allowed Linear MCP tools and applies the dynamic approval policy in one place.

## Capabilities

- Linear issue triage, clarification, decomposition, duplicate detection, and incident support.
- Slack thread intake that prepares or creates structured Linear work after approval.
- Scheduled daily triage, cycle health, backlog hygiene, project summaries, P0/P1 monitoring, and weekly initiative updates.
- One Linear MCP connection with dynamic approval policy. No custom Linear SDK tools are included.

## Prerequisites

- Node.js 24 or newer.
- An Eve deployment URL that Linear and Slack can reach over HTTPS.
- Access to create or configure a Linear Agent app.
- Access to Vercel Connect for the Slack channel and the Linear MCP OAuth connection.
- A Slack workspace where the agent app can be installed.
- A Linear workspace where the MCP-authenticated user has access to the teams, projects, issues, and initiatives the agent should operate on.

For local webhook testing, expose the local Eve server through a public HTTPS tunnel and use that public URL in Linear and Slack.

## Install And Verify The Agent

Install the registry item into an existing Eve app:

```bash
npx shadcn@latest add https://evex.sh/r/linear-operations-agent
pnpm install
```

Then run the equivalent Eve checks for your app. In this packaged example the scripts are:

```bash
pnpm info
pnpm build
```

Run these after setting `LINEAR_CONNECT_UID` and `SLACK_CONNECT_UID`; the agent intentionally fails fast if either connector UID is missing.

`pnpm info` should show:

- channels: `linear` at `/eve/v1/linear` and `slack` at `/eve/v1/slack`;
- one MCP connection named `linear`;
- the scheduled jobs and skills included with the agent;
- no custom Linear SDK tools.

## Deploy Or Expose The Eve App

Both inbound channels need an HTTPS URL:

- Linear sends `AgentSessionEvent` webhooks to `/eve/v1/linear`.
- Slack sends Connect-triggered Slack events to `/eve/v1/slack`.

For production on Vercel, Eve's Slack channel docs use:

```bash
VERCEL_USE_EXPERIMENTAL_FRAMEWORKS=1 vercel deploy --prod
```

For local testing, expose the Eve dev server through a public HTTPS tunnel and use that tunnel URL in Linear and Slack. Do not configure Linear or Slack with a plain `localhost` URL.

## Environment Variables

Start from `.env.example`:

```bash
LINEAR_AGENT_ACCESS_TOKEN=
LINEAR_WEBHOOK_SECRET=
LINEAR_CONNECT_UID=
SLACK_CONNECT_UID=

LINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID=
LINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID=
LINEAR_OPS_CYCLE_SLACK_CHANNEL_ID=
LINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID=
LINEAR_OPS_P1_SLACK_CHANNEL_ID=
```

The top-level credentials do different jobs:

- `LINEAR_AGENT_ACCESS_TOKEN` lets the Linear channel post Agent Activities and create proactive Agent Sessions.
- `LINEAR_CONNECT_UID` is the `uid` returned by `vercel connect create linear`.
- `SLACK_CONNECT_UID` is the `uid` returned by `vercel connect create slack`.

Setting `LINEAR_AGENT_ACCESS_TOKEN` does not authorize the MCP connection. If the agent needs to call Linear MCP tools, the caller still needs the Connect-backed Linear OAuth grant.

## 1. Configure The Linear Channel

Create or configure the Linear Agent app that represents this agent inside Linear.

This setup is only for the Linear channel. It does not authorize the Linear MCP connection.

In Linear:

1. Configure the app authorize URL with `actor=app`.
2. Grant the app agent scopes, including `app:assignable` and `app:mentionable`.
3. Subscribe the app webhook to `AgentSessionEvent`.
4. Set the webhook URL to:

```text
https://<your-eve-deployment>/eve/v1/linear
```

5. Copy the Linear webhook secret into `LINEAR_WEBHOOK_SECRET`.
6. Create or copy the app access token into `LINEAR_AGENT_ACCESS_TOKEN`.

The channel accepts only Linear Agent Session events with action `created` or `prompted`. It ignores other Linear webhook events. If `LINEAR_OPS_COVERED_TEAMS` or `LINEAR_OPS_COVERED_PROJECTS` is configured, the channel also filters events by the issue team or project before waking the agent.

Use this surface for:

- `@agent fai triage di questa issue`;
- `@agent trova duplicati`;
- delegating a Linear issue to the agent;
- continuing a Linear Agent Session after the agent asks a question.

## 2. Configure The Slack Channel

The Slack channel uses Vercel Connect. You do not configure `SLACK_BOT_TOKEN` or `SLACK_SIGNING_SECRET` directly in this agent.

This setup is only for Slack delivery and intake. It does not authorize Linear MCP tools.

Create a Slack Connect client and attach its trigger to Eve's Slack route. Capture the returned `uid`; the CLI lets you choose the connector name, not the final UID.

```bash
npm install -g vercel@latest
export FF_CONNECT_ENABLED=1
vercel connect create slack --name linear-operations-agent --triggers --format=json
vercel connect detach <slack-connect-uid> --yes
vercel connect attach <slack-connect-uid> --triggers --trigger-path /eve/v1/slack --yes
```

Then set:

```bash
SLACK_CONNECT_UID=<slack-connect-uid>
```

There is no fallback UID in the agent. Use the exact `uid` returned by Vercel.

The `--triggers` flag is required because Slack must deliver `app_mention` and direct message events to `/eve/v1/slack`. The channel loads recent thread context on app mentions with `since: "last-agent-reply"`, then tells the model that Slack is intake and delivery while Linear remains the operational source of truth.

Use this surface for:

- `@agent crea una issue Linear da questo thread`;
- `@agent collega questa discussione a ENG-123`;
- `@agent mostrami le issue P1 senza update`;
- scheduled digest delivery into configured Slack channels.

## 3. Configure The Linear MCP Connection

This setup is for reading and writing Linear data through MCP tools. It is separate from the Linear Agent app webhook and separate from the Slack Connect client.

The MCP connection is defined in `agent/connections/linear.ts`:

```ts
defineMcpClientConnection({
  url: "https://mcp.linear.app/mcp",
  auth: connect(getRequiredEnv("LINEAR_CONNECT_UID")),
});
```

Create a Vercel Connect connector of type `linear`, then copy the returned `uid`:

```bash
vercel connect create linear --name linear-operations-agent --format=json
```

Set:

```bash
LINEAR_CONNECT_UID=<uid returned by Vercel>
```

There is no fallback UID in the agent. The connector UID is the string passed to `connect(...)`; it is not a Linear team key, not a Slack connector UID, and not the Linear Agent app access token.

The first tool call that needs the Linear MCP connection can trigger an Eve authorization challenge. The user follows the sign-in URL, Vercel Connect stores and refreshes the Linear OAuth credential, and Eve retries the tool call. The token is not shown to the model or serialized into conversation history.

The connection allow-list is:

- read tools: `list_issues`, `get_issue`, `list_comments`, `list_projects`, `get_status_updates`, `list_cycles`, `list_issue_labels`, `list_issue_statuses`, `get_issue_status`, `extract_images`, `search_documentation`;
- write tools: `save_issue`, `save_comment`, `save_project`, `save_document`, `save_status_update`, `delete_status_update`.

## 4. Configure Scope, Slack Delivery, And Schedules

Team and project filters are comma-separated. Empty values mean all teams or all projects:

```bash
LINEAR_OPS_COVERED_TEAMS=ENG,Web
LINEAR_OPS_COVERED_PROJECTS=Payments Revamp,Mobile Foundations
LINEAR_OPS_READ_ONLY_TEAMS=Platform
```

Slack schedule delivery uses channel IDs:

```bash
LINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID=C0123DEFAULT
LINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID=C0123TRIAGE
LINEAR_OPS_CYCLE_SLACK_CHANNEL_ID=C0123CYCLE
LINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID=C0123BACKLOG
LINEAR_OPS_P1_SLACK_CHANNEL_ID=C0123P1
```

Project-specific Slack delivery uses `project-or-id:channel-id` pairs:

```bash
LINEAR_OPS_PROJECT_CHANNELS=Payments Revamp:C0123PAY,Mobile Foundations:C0456MOB
```

Explicit initiative configuration uses:

```text
initiative-id-or-name|optional-slack-channel-id|optional-enabled-flag
```

Example:

```bash
LINEAR_OPS_COVERED_INITIATIVES="Payments Revamp|C0123PAY|true,Mobile Foundations||false"
```

Weekly initiative updates are automatic only when:

- `LINEAR_OPS_AUTO_INITIATIVE_UPDATES` is not `false`;
- the initiative is listed in `LINEAR_OPS_COVERED_INITIATIVES`;
- that initiative's enabled flag is omitted or set to `true`;
- Linear MCP supports initiative status updates in the workspace.

The default cron values are UTC:

```bash
LINEAR_OPS_DAILY_TRIAGE_CRON="0 7 * * 1-5"
LINEAR_OPS_CYCLE_HEALTH_CRON="30 7 * * 1-5"
LINEAR_OPS_WEEKLY_BACKLOG_CRON="0 8 * * 1"
LINEAR_OPS_WEEKLY_PROJECT_CRON="30 8 * * 1"
LINEAR_OPS_WEEKLY_INITIATIVE_CRON="0 9 * * 1"
LINEAR_OPS_P1_MONITORING_CRON="0 13 * * 1-5"
```

Scheduled operational digests are delivered to Slack. Weekly initiative updates are created directly in Linear with `save_status_update({ type: "initiative" })`; Slack is used only for delivery errors or configured notification context.

## Approval Policy

The approval policy is implemented on the single Linear MCP connection.

No approval is required for:

- read tools;
- `save_comment` for non-destructive summaries or proposals;
- `save_status_update` only when `type === "initiative"` and the initiative is explicitly configured for weekly updates.

Approval is required for:

- issue creation;
- issue changes to state, priority, assignee, delegate, project, cycle, duplicate, parent, blocker, or related relationships;
- high-priority issue writes where priority is `1` or `2`;
- project writes;
- document writes;
- status update deletes;
- bulk or irreversible actions.

The approval predicate is synchronous and input-based. If deciding safely requires the current Linear state, the agent must first read with MCP, then ask for approval before the sensitive write.

## Smoke Tests

After deployment and env setup:

1. In Linear, mention or delegate an issue:

```text
@agent fai triage di questa issue
```

Expected: the agent replies in the Linear Agent Session and attaches proposals to the Linear context.

2. In Slack, mention the agent in a thread:

```text
@agent riassumi il thread e proponi una issue Linear
```

Expected: the agent reads recent thread context, proposes Linear work, and asks for approval before sensitive changes.

3. From Slack or Linear, ask for a read-only Linear query:

```text
@agent mostrami le issue P1 senza update
```

Expected: if the caller has not authorized the Linear MCP connection yet, Eve surfaces a Linear Connect authorization challenge. After authorization, the agent can call the allowed Linear MCP read tools.

4. Trigger a development schedule:

```bash
curl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-triage-digest
```

Other schedule ids are `cycle-health`, `weekly-backlog-hygiene`, `weekly-project-summary`, `weekly-initiative-updates`, and `p1-monitoring`.

## Troubleshooting

If Linear mentions do nothing, check that the Linear app webhook points to `/eve/v1/linear`, subscribes to `AgentSessionEvent`, and sends a valid `Linear-Signature` matching `LINEAR_WEBHOOK_SECRET`.

If Linear replies fail, check `LINEAR_AGENT_ACCESS_TOKEN`. This token is for Agent Activities, not for MCP data access.

If Slack mentions do nothing, check that the Slack Connect client is attached with `--triggers` and `--trigger-path /eve/v1/slack`, and that `SLACK_CONNECT_UID` matches the created connector UID.

If Slack-triggered Linear reads or writes fail with authorization required, complete the Linear MCP Connect sign-in flow for the caller. `LINEAR_CONNECT_UID` must match the Linear Connect OAuth connector, not the Slack connector.

If scheduled jobs do not post, set the relevant Slack channel ID env var. The schedule handlers return without posting when no target channel ID is configured.

If weekly initiative updates do not write to Linear, confirm the initiative is explicitly listed in `LINEAR_OPS_COVERED_INITIATIVES` and that the workspace supports Linear initiatives or roadmaps.
