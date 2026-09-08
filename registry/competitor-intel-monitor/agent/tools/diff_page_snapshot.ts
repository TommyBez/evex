import { defineTool } from "eve/tools";
import { z } from "zod";

import { createSnapshotStore, recordFetchedSnapshot } from "../lib/snapshot-store.js";
import { watchConfig } from "../lib/watch-config.js";

export default defineTool({
  description:
    "Compare a fetched page against the persistent snapshot store, score the textual change, and report whether the change clears the configured alert thresholds. First-seen URLs are stored as a committed baseline and never alert. Threshold-clearing changes are stored as pending until send_digest delivers successfully, so a failed send can be retried. Below-threshold changes replace the committed snapshot immediately.",
  inputSchema: z.object({
    url: z.string().url(),
    text: z.string().describe("Normalized page text from fetch_competitor_page."),
    hash: z.string().min(1),
    fetchedAt: z.string().min(1),
  }),
  async execute({ url, text, hash, fetchedAt }) {
    if (!watchConfig.urls.includes(url)) {
      return {
        ok: false,
        url,
        notOnWatchList: true,
        note: "URL is not on the watch list. Do not invent diffs.",
      };
    }

    return recordFetchedSnapshot({
      store: createSnapshotStore(process.env, watchConfig.storePath),
      url,
      text,
      hash,
      fetchedAt,
      thresholds: watchConfig.alert,
    });
  },
});
