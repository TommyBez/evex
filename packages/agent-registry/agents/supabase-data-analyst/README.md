# Supabase Data Analyst

An Eve-native Slack analyst for a single Supabase project. It answers Slack
mentions and DMs, inspects schema metadata, and runs read-only SQL through the
hosted Supabase MCP server. There is no custom query tool: every database
operation flows through Eve's MCP client connection to
`https://mcp.supabase.com/mcp`.

## Install

Install this registry item into an existing Eve app:

```bash
npx shadcn@latest add https://evex.sh/r/supabase-data-analyst
```

Then install the public runtime dependencies listed by the registry item.

## How it answers

The agent uses Eve's MCP client connection (`agent/connections/supabase.ts`) to
talk to the Supabase remote MCP server. The model discovers Supabase tools
through the built-in `connection_search` and calls them by their qualified name,
such as `supabase__list_tables` or `supabase__execute_sql`.

The connection URL is built from env vars and always sets:

- `project_ref` to scope the server to one Supabase project,
- `read_only=true` so the server executes every query as a read-only Postgres
  user,
- `features=database,docs` (override with `SUPABASE_DATA_ANALYST_FEATURES`) to
  limit which tool groups the server exposes.

A client-side `tools.allow` list in `agent/connections/supabase.ts` drops any
write tool the server still advertises, so the model never sees
`apply_migration`, `deploy_edge_function`, `create_project`, `create_branch`,
`update_storage_config`, and similar mutating tools.

## Start using it in Slack

This agent uses Eve's documented Slack channel path through Vercel Connect. Do
not create or manage `SLACK_BOT_TOKEN` or `SLACK_SIGNING_SECRET` variables.

Before connecting Slack, make sure the Eve app that installed this registry item
is deployed on Vercel or otherwise reachable through HTTPS. Slack events must be
able to reach the Eve Slack route:

```text
/eve/v1/slack
```

Create the Slack Connect client from the Vercel project used by the Eve app:

```bash
npm install -g vercel@latest
vercel connect create slack --triggers
```

This command is the Slack installation step. It creates the Vercel Connect
connector and opens the Slack authorization flow. Choose the Slack workspace
where the agent should live and approve the app installation there. If the CLI
prints an authorization URL instead of opening a browser, open that URL and
complete the Slack install.

After authorization succeeds, copy the UID printed by the command. Then attach
that Slack client to Eve's Slack route:

```bash
vercel connect detach <uid> --yes
vercel connect attach <uid> --triggers --trigger-path /eve/v1/slack --yes
```

Set the same UID in the Eve app environment and redeploy the app:

```env
SUPABASE_DATA_ANALYST_SLACK_CONNECT_UID=<uid>
```

The default UID used by the agent is `slack/supabase-data-analyst`.

After the app is deployed:

1. Open the same Slack workspace that you authorized during
   `vercel connect create slack --triggers`.
2. Find the Slack app that was installed during that authorization flow.
3. Add the app to every channel where it should answer.
4. In a channel, mention the app and ask a database question.
5. In a DM, message the app directly.

If you cannot find the app in Slack, the Slack authorization step was not
completed for that workspace. Run `vercel connect create slack --triggers`
again from the Vercel project, authorize the correct workspace, attach the new
UID to `/eve/v1/slack`, update `SUPABASE_DATA_ANALYST_SLACK_CONNECT_UID`, and
redeploy.

Good first prompts:

```text
What tables are there in the database? Use the Supabase MCP tools.
```

```text
Show total signups by month for the last 6 months.
```

If the agent does not answer, verify:

- `eve info --json` lists a Slack channel with `urlPath: "/eve/v1/slack"`;
- `SUPABASE_DATA_ANALYST_SLACK_CONNECT_UID` exactly matches the Vercel Connect
  UID;
- the Connect trigger is attached with `--trigger-path /eve/v1/slack`;
- the app was redeployed after setting env vars;
- `SUPABASE_DATA_ANALYST_ACCESS_TOKEN` is a valid Supabase personal access
  token;
- `SUPABASE_DATA_ANALYST_PROJECT_REF` matches the project the token can access.

## Supabase setup

The agent talks to the hosted Supabase MCP server at
`https://mcp.supabase.com/mcp`. It authenticates with a Supabase personal
access token (PAT) sent as `Authorization: Bearer <token>` on every MCP request.

1. Do not connect the agent to production data. Supabase MCP is designed for
   development and testing. Use a development project, a preview branch, or a
   project with obfuscated data.
2. In your Supabase account, generate a personal access token. Name it for this
   agent, e.g. `Supabase Data Analyst MCP token`.
3. Copy the target project's ref from the Supabase dashboard URL or project
   settings.
4. Set the runtime environment:

```env
SUPABASE_DATA_ANALYST_ACCESS_TOKEN=<supabase-pat>
SUPABASE_DATA_ANALYST_PROJECT_REF=<project-ref>
SUPABASE_DATA_ANALYST_READ_ONLY=true
SUPABASE_DATA_ANALYST_FEATURES=database,docs
SUPABASE_DATA_ANALYST_MCP_URL=https://mcp.supabase.com/mcp
SUPABASE_DATA_ANALYST_SLACK_CONNECT_UID=slack/supabase-data-analyst
```

`SUPABASE_DATA_ANALYST_READ_ONLY=true` is the enforcement boundary: the Supabase
MCP server runs every query as a read-only Postgres user. The client-side
`tools.allow` list in `agent/connections/supabase.ts` is defense in depth; keep
both.

`SUPABASE_DATA_ANALYST_FEATURES` accepts a comma-separated subset of
`account-management`, `branching`, `database`, `debugging`, `development`,
`edge-functions`, `storage`, `docs`. The default `database,docs` keeps the
surface small. Add `debugging` to let the agent read service logs and advisors,
or `development` to allow `generate_typescript_types`. Avoid
`account-management`, `branching`, `edge-functions`, and `storage` unless the
Slack audience is allowed to see that surface; even in read-only mode those
groups expose non-analytical metadata.

`SUPABASE_DATA_ANALYST_MCP_URL` defaults to the hosted endpoint. Override it to
point at a local Supabase CLI MCP server (`http://localhost:54321/mcp`) during
local development.

## Runtime contract

Read-only access can still expose sensitive data. Do not point this agent at a
project with PII unless the Slack workspace and channel audience are allowed to
see that data. The agent's instructions tell the model never to paste
publishable keys, service role keys, or personal access tokens into Slack, even
if a tool returns them.
