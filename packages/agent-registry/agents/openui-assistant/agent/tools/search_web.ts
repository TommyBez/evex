import { defineTool } from "eve/tools";
import { z } from "zod";

const searchWebInput = z.object({
  query: z.string().min(1).describe("Search query"),
});

export type SearchWebInput = z.infer<typeof searchWebInput>;

export type SearchWebOutput = {
  kind: "mock-search-results";
  query: string;
  results: Array<{
    snippet: string;
    title: string;
  }>;
};

export default defineTool({
  description:
    "Return deterministic mock search results for OpenUI demo layouts. This does not perform live web search and must be labeled as demo data.",
  inputSchema: searchWebInput,
  execute({ query }): SearchWebOutput {
    return {
      kind: "mock-search-results",
      query,
      results: [
        {
          title: `Demo result for "${query}"`,
          snippet: `Example overview card for ${query}. This is mock data for layout testing.`,
        },
        {
          title: `${query} - Demo trend`,
          snippet: `Example trend snippet for ${query}. Do not treat this as live research.`,
        },
        {
          title: `Understanding ${query}`,
          snippet: `Example explainer snippet for ${query}, included for demo UI rendering.`,
        },
      ],
    };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: output,
    };
  },
});
