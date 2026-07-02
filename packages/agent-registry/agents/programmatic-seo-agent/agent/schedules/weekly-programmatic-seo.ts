import { defineSchedule } from "eve/schedules";

import { pseoConfig } from "../lib/pseo-config.js";

export default defineSchedule({
  cron: pseoConfig.weeklyCron,
  markdown: `Run the weekly programmatic SEO batch.

1. Load the programmatic-seo skill before doing any keyword or content work.
2. The product repository is checked out at /workspace/repo. Explore it with bash, glob, grep, and read_file to understand the product and its content conventions: read the README and a few existing pages under ${pseoConfig.targetDir} (or the closest content directory) to match format and frontmatter. If the checkout is missing, stop and report the missing configuration.
3. Derive seed keywords from the product context, then call discover_keywords. Design 1-2 repeatable page patterns (playbooks) from the results and validate the exact permutations with validate_keywords.
4. Keep only keywords with search volume >= ${pseoConfig.minSearchVolume} that the repository does not already cover. If nothing qualifies, stop and report that this week's run is intentionally skipped — do not force thin pages.
5. For each selected keyword (at most ${pseoConfig.maxPagesPerRun} pages per run), call research_keyword with a clear objective and 2-3 focused queries, and ground every factual claim in the returned excerpts or in repository content.
6. Write the pages into /workspace/repo/${pseoConfig.targetDir} with write_file following the programmatic-seo quality bar. Then publish from the sandbox: git checkout -B pseo/<year>-w<ISO week> (derived from today's date so a replayed run reuses the same branch and pull request), stage only ${pseoConfig.targetDir}, commit, git push -u origin, and open the pull request with curl against api.github.com (authentication is injected at the firewall — never put a token in a URL or command). If an open pull request for the branch already exists, the push updated it; do not open a duplicate. Never push to the default branch and never merge the pull request.

If any required environment variable is missing (PSEO_GITHUB_REPO, PSEO_GITHUB_TOKEN, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD, PARALLEL_API_KEY), stop and report the missing configuration. Do not invent search volumes, sources, or product facts.`,
});
