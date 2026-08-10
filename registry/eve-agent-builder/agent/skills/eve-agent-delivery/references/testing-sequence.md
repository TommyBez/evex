# Local testing sequence

Eve command reference: `node_modules/eve/docs/reference/cli.md`  
Deployment checklist: `node_modules/eve/docs/guides/deployment/overview.md` and
`node_modules/eve/docs/guides/deployment/vercel.mdx`

Run the narrowest checks that prove the changed agent works, then broaden before
deployment. Use `run_eve_cli` for the supported structured operations in steps
4–6. Use `bash` for the bounded local-server smoke test in step 7; Eve deploy,
link, channel setup, and Vercel CLI remain routed through their managed tools.

1. Install dependencies.
2. `run_vercel_cli` action `link_project` when local model calls need
   `VERCEL_OIDC_TOKEN`. It runs `vercel link` and then
   `vercel env pull .env.local`. **Done when** `VERCEL_OIDC_TOKEN` is in
   `.env.local` or model calls succeed without it.
3. Typecheck or repo check. **Done when** exit 0.
4. `run_eve_cli`: `info --json`. **Done when** the agent surface validates.
5. `run_eve_cli`: `build`. **Done when** the build completes without error.
6. `run_eve_cli`: `eval --skip-report` when evals exist. **Done when** every eval
   passes.
7. Local session smoke test per the deployment overview. With `bash`, start
   `eve dev --no-ui --host 127.0.0.1` or the host app's local dev server as a
   bounded background process, wait for readiness, exercise a realistic local
   session, and always stop the process in cleanup. Use `eve start` only when
   production route auth is explicitly configured. **Done when** the response
   exercises the changed behavior — not merely HTTP 200.
8. Channel smoke test when the channel is part of the change. **Done when** an
   inbound event reaches the handler and produces the expected output.
9. `verify_vercel_preview` for deployed previews. **Done when** the health,
   session, and stream checks all report 2xx and the command exits 0. The tool
   brokers `VERCEL_AUTOMATION_BYPASS_SECRET` for Deployment Protection and
   `EVE_ROUTE_AUTHORIZATION` for Eve route auth only when the exact HTTPS
   origin is configured in `EVE_VERIFICATION_ALLOWED_ORIGINS`, then clears the
   transform. Without route authorization, the target must explicitly allow
   unauthenticated HTTP sessions.

When a check fails, inspect the artifact or log, fix the root cause, and rerun
the failed check. Do not treat a build-only pass as proof of behavior when an
eval or channel smoke test is available. Do not deploy to preview until every
required step above passes.
