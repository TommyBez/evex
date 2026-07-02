import { defineSandbox, type SandboxNetworkPolicy } from "eve/sandbox";
import { vercel } from "eve/sandbox/vercel";

import { SANDBOX_REPO_DIR, pseoConfig } from "./lib/pseo-config.js";

const GIT_IDENTITY_NAME = "programmatic-seo-agent";
const GIT_IDENTITY_EMAIL = "programmatic-seo-agent@users.noreply.github.com";
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export default defineSandbox({
  backend: vercel({ resources: { vcpus: 2 } }),
  async onSession({ use }) {
    const sandbox = await use({ networkPolicy: sessionNetworkPolicy() });

    // Without a token the agent could clone a public repo but never push or
    // open the PR, burning keyword/research API calls first. Skipping the
    // checkout makes the run stop at the missing-checkout guard instead.
    const repo = pseoConfig.repo;
    const token = process.env.PSEO_GITHUB_TOKEN?.trim();
    if (!(repo && token)) {
      return;
    }
    if (!REPO_PATTERN.test(repo)) {
      throw new Error("PSEO_GITHUB_REPO must be in owner/repo form.");
    }

    await sandbox.run({
      command: [
        `git config --global user.name "${GIT_IDENTITY_NAME}" &&`,
        `git config --global user.email "${GIT_IDENTITY_EMAIL}" &&`,
        `if [ -d ${SANDBOX_REPO_DIR}/.git ];`,
        `then git -C ${SANDBOX_REPO_DIR} fetch --depth 1 origin HEAD && git -C ${SANDBOX_REPO_DIR} reset --hard FETCH_HEAD;`,
        `else git clone --depth 1 https://github.com/${repo}.git ${SANDBOX_REPO_DIR};`,
        "fi",
      ].join(" "),
    });
  },
});

// Inject the GitHub token at the firewall so it never enters the sandbox
// process, per eve's credential-brokering model: Basic auth on github.com
// covers git clone/fetch/push, Bearer auth on api.github.com covers the
// pull-request API calls the agent makes with curl.
function sessionNetworkPolicy(): SandboxNetworkPolicy {
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
      "api.github.com": [
        {
          transform: [{ headers: { authorization: `Bearer ${token}` } }],
        },
      ],
      "*": [],
    },
  };
}
