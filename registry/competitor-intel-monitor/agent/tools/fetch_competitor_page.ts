import { defineTool } from "eve/tools";
import { z } from "zod";

import { fetchCompetitorPage } from "../lib/fetch-page.js";
import { hashNormalizedText, normalizePageText } from "../lib/page-diff.js";
import { watchConfig } from "../lib/watch-config.js";

export default defineTool({
  description:
    "Fetch one configured competitor URL after checking that origin's robots.txt. Skips the page when robots.txt disallows this user-agent, when robots.txt cannot be reached, or when the URL is not on the watch list. Returns normalized text and a content hash for diffing.",
  inputSchema: z.object({
    url: z.string().url().describe("Exact https URL from the configured watch list."),
  }),
  async execute({ url }) {
    if (!watchConfig.urls.includes(url)) {
      return {
        ok: false,
        url,
        notOnWatchList: true,
        note: "URL is not in COMPETITOR_INTEL_URLS or COMPETITOR_INTEL_URLS_FILE. Do not invent URLs.",
      };
    }

    const fetched = await fetchCompetitorPage(url, watchConfig.userAgent);
    if (!fetched.ok) {
      return fetched;
    }

    const text = normalizePageText(fetched.body);
    return {
      ok: true,
      url: fetched.url,
      finalUrl: fetched.finalUrl,
      status: fetched.status,
      contentType: fetched.contentType,
      text,
      hash: hashNormalizedText(text),
      fetchedAt: new Date().toISOString(),
    };
  },
});
