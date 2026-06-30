# Slack channel setup

When a Slack channel is needed, follow the Eve Slack docs workflow:

1. Add the Slack channel and `@vercel/connect` dependency.
2. Call `run_vercel_cli` with `connect_create_slack`.
3. Detach the returned Connect UID from the default destination.
4. Attach the Connect UID to `/eve/v1/slack` with triggers enabled.
5. Deploy and verify Slack events reach the route.

See [channel-routes](./channel-routes.md) for route paths and post-deploy
verification.
