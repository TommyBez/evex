import { defineSchedule } from "eve/schedules";

import { pseoConfig } from "../lib/pseo-config.js";

export default defineSchedule({
  cron: pseoConfig.weeklyCron,
  markdown: `Run the weekly programmatic SEO batch.

1. Load the programmatic-seo skill before doing any keyword or content work.
2. Use read_product_repo to understand the product and its content conventions: list the tree, read the README, and read a few existing pages under ${pseoConfig.targetDir} (or the closest content directory) to match format and frontmatter.
3. Derive seed keywords from the product context, then call discover_keywords. Design 1-2 repeatable page patterns (playbooks) from the results and validate the exact permutations with validate_keywords.
4. Keep only keywords with search volume >= ${pseoConfig.minSearchVolume} that the repository does not already cover. If nothing qualifies, stop and report that this week's run is intentionally skipped — do not force thin pages.
5. For each selected keyword (at most ${pseoConfig.maxPagesPerRun} pages per run), call research_keyword with a clear objective and 2-3 focused queries, and ground every factual claim in the returned excerpts or in repository content.
6. Generate the pages following the programmatic-seo quality bar, then publish once with publish_seo_pages: confirmPublish=true, branch pseo/<year>-w<ISO week> derived from today's date so a replayed run reuses the same branch and pull request, and every path inside ${pseoConfig.targetDir}. Never merge the pull request.

If any required environment variable is missing (PSEO_GITHUB_REPO, PSEO_GITHUB_TOKEN, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD, PARALLEL_API_KEY), stop and report the missing configuration. Do not invent search volumes, sources, or product facts.`,
});
