# Local testing sequence

Run the narrowest checks that prove the changed agent works, then broaden before
deployment.

1. Install dependencies.
2. Run `run_vercel_cli` action `link_project` when local model calls need
   `VERCEL_OIDC_TOKEN`. **Done when** `VERCEL_OIDC_TOKEN` is present in
   `.env.local` or model calls succeed without it.
3. Typecheck or repo check. **Done when** the command exits 0.
4. `eve info --json`. **Done when** the agent surface validates.
5. `eve build`. **Done when** the build completes without error.
6. `eve eval --skip-report` when evals exist. **Done when** every eval passes.
7. Local session smoke test. **Done when** the response exercises the changed
   behavior — not merely HTTP 200.
8. Channel smoke test when the channel is part of the change. **Done when** an
   inbound event reaches the handler and produces the expected output.
9. For protected Vercel previews, `verify_vercel_preview`. **Done when** the
   bypass secret is brokered, the session succeeds, and the transform is
   cleared.

When a check fails, inspect the artifact or log, fix the root cause, and rerun
the failed check. Do not treat a build-only pass as proof of behavior when an
eval or channel smoke test is available. Do not deploy to preview until every
required step above passes.
