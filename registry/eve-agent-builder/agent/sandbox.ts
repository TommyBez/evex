import { defineSandbox } from "eve/sandbox";
import { vercel } from "eve/sandbox/vercel";

export default defineSandbox({
  backend: vercel({
    resources: {
      vcpus: 2,
    },
  }),
  // Template-scoped prewarm: fill the npx cache with the CLIs every session
  // shells out to, so run_eve_cli and run_vercel_cli skip the cold download.
  // Best-effort — a registry hiccup must not fail the build.
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command:
        "(npx --yes eve@0.18.2 --version && npx --yes vercel@latest --version) || echo 'CLI prewarm skipped'",
    });
  },
});
