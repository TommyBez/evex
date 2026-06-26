# Supabase Data Analyst

An Eve-native Slack analyst for a single Supabase project. It answers Slack
mentions and DMs with schema inspection and read-only SQL through the hosted
Supabase MCP server. The agent can only run read-only SQL queries: it exposes
just `supabase__list_tables` and `supabase__execute_sql`, and nothing else.

## Install

Install this registry item into an existing Eve app:

```bash
npx shadcn@latest add https://evex.sh/r/supabase-data-analyst
```

Then install the public runtime dependencies listed by the registry item.

## How it answers

The agent uses Eve's MCP client connection (`agent/connections/supabase.ts`) to
talk to the Supabase remote MCP server. The model discovers Supabase tools
through the built-in `connection_search` and calls them by their qualified name.

This agent only runs read-only SQL queries. The only tools it exposes are:

- `supabase__list_tables` — list tables in the database, for schema inspection.
- `supabase__execute_sql` — run a read-only SQL query.

No other Supabase MCP tools are available. Write tools, migrations, Edge
Functions, branches, storage, logs, advisors, account management, project
URL/key helpers, and docs search are all excluded.

The connection URL is built from env vars and always sets:

- `project_ref` to scope the server to one Supabase project (required for the
  hosted endpoint; optional only for a local Supabase CLI MCP server where the
  project is implicit),
- `read_only=true` so the server executes every query as a read-only Postgres
  user,
- `features=database` so the server only publishes the database tool group.

A client-side `tools.allow` list in `agent/connections/supabase.ts` further
restricts discovery to `list_tables` and `execute_sql`, so even if the server
advertises other database tools (such as `apply_migration`, `list_extensions`,
`list_migrations`) the model never sees them. `SUPABASE_DATA_ANALYST_READ_ONLY`
cannot be set to `false` and `SUPABASE_DATA_ANALYST_FEATURES` only accepts
`database`; the config loader rejects anything else at startup.
`SUPABASE_DATA_ANALYST_PROJECT_REF` is required when
`SUPABASE_DATA_ANALYST_MCP_URL` points at the hosted Supabase MCP server (or any
non-localhost host); without it the config loader fails startup because the
account-level access token would otherwise be able to reach every project in the
Supabase account, breaking the single-project promise.

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
- `SUPABASE_DATA_ANALYST_PROJECT_REF` matches the project the token can access
  and is set (the config loader fails startup if it is missing while
  `SUPABASE_DATA_ANALYST_MCP_URL` points at the hosted endpoint).

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
SUPABASE_DATA_ANALYST_FEATURES=database
SUPABASE_DATA_ANALYST_MCP_URL=https://mcp.supabase.com/mcp
SUPABASE_DATA_ANALYST_SLACK_CONNECT_UID=slack/supabase-data-analyst
```

`SUPABASE_DATA_ANALYST_PROJECT_REF` is required for the hosted Supabase MCP
server. It scopes the connection to a single project so the account-level PAT
cannot reach other projects in the same Supabase account. The config loader
fails startup if it is missing while `SUPABASE_DATA_ANALYST_MCP_URL` points at a
non-localhost host. It may be omitted only when
`SUPABASE_DATA_ANALYST_MCP_URL` points at a local Supabase CLI MCP server
(`http://localhost:54321/mcp`), where the project is implicit.

`SUPABASE_DATA_ANALYST_READ_ONLY` must be `true` (the default). The config
loader rejects `false` at startup because this agent only runs read-only SQL
queries.

`SUPABASE_DATA_ANALYST_FEATURES` must be `database` (the default). The config
loader rejects any other feature group, because every other group exposes
non-query operations (migrations, Edge Functions, branches, storage, logs,
advisors, account management, project URL/key helpers, docs search). Keeping
`features=database` makes the Supabase MCP server publish only database tools,
and the client-side `tools.allow` list in `agent/connections/supabase.ts`
further narrows that to `list_tables` and `execute_sql`.

`SUPABASE_DATA_ANALYST_MCP_URL` defaults to the hosted endpoint. Override it to
point at a local Supabase CLI MCP server (`http://localhost:54321/mcp`) during
local development; in that case `SUPABASE_DATA_ANALYST_PROJECT_REF` may be
omitted.

## Runtime contract

Read-only access can still expose sensitive data. Do not point this agent at a
project with PII unless the Slack workspace and channel audience are allowed to
see that data. The agent's instructions tell the model never to paste
publishable keys, service role keys, or personal access tokens into Slack, even
if a tool returns them.

The agent cannot write, migrate, deploy, branch, or configure anything. If a
Slack request needs one of those operations, the agent says it cannot be done
and proposes a read-only SQL alternative.
