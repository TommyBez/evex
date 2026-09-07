import { defineTool } from "eve/tools";
import { z } from "zod";

import { diffNormalizedText } from "../lib/page-diff.js";
import { createSnapshotStore } from "../lib/snapshot-store.js";
import { toScoredChange } from "../lib/thresholds.js";
import { watchConfig } from "../lib/watch-config.js";

export default defineTool({
  description:
    "Compare a fetched page against the persistent snapshot store, score the textual change, persist the new snapshot as the next baseline, and report whether the change clears the configured alert thresholds. First-seen URLs are stored as a baseline and never alert.",
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

    const store = createSnapshotStore(process.env, watchConfig.storePath);
    const previous = await store.get(url);
    await store.set({ url, hash, text, fetchedAt });

    if (!previous) {
      return {
        ok: true,
        ...toScoredChange({
          url,
          fetchedAt,
          isBaseline: true,
          diff: {
            changed: false,
            changedChars: 0,
            score: 0,
            addedWords: [],
            removedWords: [],
            excerpt: "",
          },
          thresholds: watchConfig.alert,
        }),
      };
    }

    if (previous.hash === hash) {
      return {
        ok: true,
        ...toScoredChange({
          url,
          fetchedAt,
          isBaseline: false,
          diff: {
            changed: false,
            changedChars: 0,
            score: 0,
            addedWords: [],
            removedWords: [],
            excerpt: "",
          },
          thresholds: watchConfig.alert,
        }),
      };
    }

    const diff = diffNormalizedText(previous.text, text);
    return {
      ok: true,
      previousFetchedAt: previous.fetchedAt,
      ...toScoredChange({
        url,
        fetchedAt,
        isBaseline: false,
        diff,
        thresholds: watchConfig.alert,
      }),
    };
  },
});
