# Postgres Data Analyst

An Eve-native Slack analyst for a single Postgres database. It answers Slack
mentions and DMs, inspects schema metadata, and runs bounded read-only SQL
through authored tools.

## Install

Install this registry item into an existing Eve app:

```bash
npx shadcn@latest add @evex/postgres-data-analyst
```

Then install the public runtime dependencies listed by the registry item.

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
DATA_ANALYST_SLACK_CONNECT_UID=<uid>
```

The default UID used by the agent is `slack/postgres-data-analyst`.

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
UID to `/eve/v1/slack`, update `DATA_ANALYST_SLACK_CONNECT_UID`, and redeploy.

Good first prompts:

```text
What schemas and tables can you see?
```

```text
Show total signups by month for the last 6 months.
```

If the agent does not answer, verify:

- `eve info --json` lists a Slack channel with `urlPath: "/eve/v1/slack"`;
- `DATA_ANALYST_SLACK_CONNECT_UID` exactly matches the Vercel Connect UID;
- the Connect trigger is attached with `--trigger-path /eve/v1/slack`;
- the app was redeployed after setting env vars;
- `DATA_ANALYST_DATABASE_URL` points to a working read-only Postgres role.

## Database setup

Create a read-only Postgres role and use it for `DATA_ANALYST_DATABASE_URL`.
The role must not have write privileges. SQL validation in the agent is defense
in depth; the database role is the enforcement boundary.

```sql
create role data_analyst_reader login password 'replace-me';
grant usage on schema public to data_analyst_reader;
grant select on all tables in schema public to data_analyst_reader;
alter default privileges in schema public
  grant select on tables to data_analyst_reader;
```

Set the runtime environment:

```env
DATA_ANALYST_DATABASE_URL=postgres://data_analyst_reader:replace-me@host/db
DATA_ANALYST_ALLOWED_SCHEMAS=public
DATA_ANALYST_BLOCKED_TABLES=
DATA_ANALYST_MAX_ROWS=200
DATA_ANALYST_STATEMENT_TIMEOUT_MS=10000
DATA_ANALYST_SLACK_CONNECT_UID=slack/postgres-data-analyst
```

`DATA_ANALYST_BLOCKED_TABLES` accepts comma-separated table names such as
`users,public.accounts`.

## Neon

Use a read-only role on the target branch, or point the agent at a reporting
branch/replica. Keep `DATA_ANALYST_ALLOWED_SCHEMAS` limited to the reporting
schemas the Slack audience is allowed to inspect.

## Supabase

Use a dedicated read-only Postgres role instead of the service role. Grant
`SELECT` only on the schemas/tables the agent should analyze, then use that
connection string as `DATA_ANALYST_DATABASE_URL`.

## Runtime contract

Read-only access can still expose sensitive data. Do not grant this agent
access to PII tables unless the Slack workspace and channel audience are allowed
to see that data.
