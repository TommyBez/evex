import { defineSandbox, type SandboxNetworkPolicy } from "eve/sandbox";
import { vercel } from "eve/sandbox/vercel";

import { SANDBOX_REPO_DIR, pseoConfig } from "./lib/pseo-config.js";

export default defineSandbox({
  backend: vercel({ resources: { vcpus: 2 } }),
  async onSession({ use }) {
    const sandbox = await use({ networkPolicy: checkoutNetworkPolicy() });

    const repo = pseoConfig.repo;
    if (!repo) {
      return;
    }

    await sandbox.run({
      command: [
        `if [ -d ${SANDBOX_REPO_DIR}/.git ];`,
        `then git -C ${SANDBOX_REPO_DIR} fetch --depth 1 origin HEAD && git -C ${SANDBOX_REPO_DIR} reset --hard FETCH_HEAD;`,
        `else git clone --depth 1 https://github.com/${repo}.git ${SANDBOX_REPO_DIR};`,
        "fi",
      ].join(" "),
    });

    // The brokered GitHub credential exists only for the checkout above.
    // Dropping it here means nothing in the sandbox can push; the guarded
    // publish_seo_pages tool is the only write path to the repository.
    await sandbox.setNetworkPolicy({ allow: { "*": [] } });
  },
});

// Inject the GitHub token at the firewall so it never enters the sandbox
// process, per eve's credential-brokering model.
function checkoutNetworkPolicy(): SandboxNetworkPolicy {
  const token = process.env.PSEO_GITHUB_TOKEN?.trim();
  if (!token) {
    return "allow-all";
  }

  const basicCredentials = Buffer.from(`x-access-token:${token}`).toString("base64");
  return {
    allow: {
      "github.com": [
        {
          transform: [
            { headers: { authorization: `Basic ${basicCredentials}` } },
          ],
        },
      ],
      "*": [],
    },
  };
}
