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

## Slack setup

This agent uses Eve's documented Slack channel path through Vercel Connect.
Create a Slack Connect client, attach it to Eve's Slack route, and set the UID
in the app environment.

```bash
npm install -g vercel@latest
export FF_CONNECT_ENABLED=1
vercel connect create slack --triggers
vercel connect detach <uid> --yes
vercel connect attach <uid> --triggers --trigger-path /eve/v1/slack --yes
```

Set:

```env
DATA_ANALYST_SLACK_CONNECT_UID=<uid>
```

The default UID used by the agent is `slack/postgres-data-analyst`.

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
