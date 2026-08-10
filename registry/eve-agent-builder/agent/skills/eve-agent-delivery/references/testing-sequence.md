# Local testing sequence

Eve command reference: `node_modules/eve/docs/reference/cli.md`  
Deployment checklist: `node_modules/eve/docs/guides/deployment.md`

Run the narrowest checks that prove the changed agent works, then broaden before
deployment. Use `run_eve_cli` for Eve CLI commands — not ordinary shell.

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
7. Local session smoke test per deployment doc section 9, using `eve start`,
   `eve dev --no-ui`, or the host app's local dev server. **Done when** the
   response exercises the changed behavior — not merely HTTP 200.
8. Channel smoke test when the channel is part of the change. **Done when** an
   inbound event reaches the handler and produces the expected output.
9. `verify_vercel_preview` for deployed previews. **Done when** the health,
   session, and stream checks succeed. For protected previews the bypass
   secret is brokered and the transform cleared; unprotected previews verify
   without it.

When a check fails, inspect the artifact or log, fix the root cause, and rerun
the failed check. Do not treat a build-only pass as proof of behavior when an
eval or channel smoke test is available. Do not deploy to preview until every
required step above passes.
