import { defineSandbox } from "eve/sandbox";
import { vercel } from "eve/sandbox/vercel";

const PREWARM_TIMEOUT_MS = 120_000;

export default defineSandbox({
  backend: vercel({
    resources: {
      vcpus: 2,
    },
  }),
  // Template-scoped prewarm: fill the npx cache with the CLIs every session
  // shells out to, so run_eve_cli and run_vercel_cli skip the cold download.
  // Best-effort — a registry hiccup or stall must not fail the build: the
  // abort signal bounds a hung npx and the catch swallows the rejection.
  async bootstrap({ use }) {
    const sandbox = await use();
    try {
      await sandbox.run({
        abortSignal: AbortSignal.timeout(PREWARM_TIMEOUT_MS),
        command:
          "(npx --yes eve@0.18.2 --version && npx --yes vercel@latest --version) || echo 'CLI prewarm skipped'",
      });
    } catch {
      // Sessions fall back to downloading the CLIs on first use.
    }
  },
});
