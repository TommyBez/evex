import Parallel from "parallel-web";
import { defineTool } from "eve/tools";
import { z } from "zod";

import { hotTopicConfig } from "../lib/hot-topic-config.js";

export default defineTool({
  description:
    "Research a hot topic with the Parallel web search API and return ranked excerpts with provenance.",
  inputSchema: z.object({
    topic: z.string().min(1).describe("The hot topic to research, in natural language."),
    searchQueries: z
      .array(z.string().min(1))
      .min(1)
      .max(5)
      .describe("2-3 concise keyword queries (3-6 words each) to focus the search."),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe("Upper bound on returned results. Defaults to the agent config."),
  }),
  async execute({ topic, searchQueries, maxResults }) {
    const apiKey = process.env.PARALLEL_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "PARALLEL_API_KEY", topic };
    }

    const client = new Parallel({ apiKey });
    const { results } = await client.search({
      objective: `Research the following hot topic surfaced from X: ${topic}`,
      search_queries: searchQueries,
      mode: hotTopicConfig.searchMode,
      advanced_settings: {
        max_results: maxResults ?? hotTopicConfig.searchMaxResults,
      },
    });

    return {
      topic,
      resultCount: results.length,
      results: results.map((entry) => ({
        url: entry.url,
        title: entry.title ?? null,
        publishDate: entry.publish_date ?? null,
        excerpts: entry.excerpts,
      })),
    };
  },
});
