import Parallel from "parallel-web";
import { defineTool } from "eve/tools";
import { z } from "zod";

import { pseoConfig } from "../lib/pseo-config.js";

export default defineTool({
  description:
    "Research a target keyword or keyword cluster with the Parallel web search API and return ranked excerpts with provenance. Use the results to ground every factual claim on the generated page.",
  inputSchema: z.object({
    keyword: z
      .string()
      .min(1)
      .describe("The target keyword or cluster this research supports."),
    objective: z
      .string()
      .min(1)
      .describe(
        "What the page needs to answer for a searcher with this query, in natural language.",
      ),
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
  async execute({ keyword, objective, searchQueries, maxResults }) {
    const apiKey = process.env.PARALLEL_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "PARALLEL_API_KEY", keyword };
    }

    const client = new Parallel({ apiKey });
    const { results } = await client.search({
      objective,
      search_queries: searchQueries,
      mode: pseoConfig.searchMode,
      advanced_settings: {
        max_results: maxResults ?? pseoConfig.searchMaxResults,
      },
    });

    return {
      keyword,
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
