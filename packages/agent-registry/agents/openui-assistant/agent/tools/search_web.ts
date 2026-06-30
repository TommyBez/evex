import { defineTool } from "eve/tools";
import { z } from "zod";

const searchWebInput = z.object({
  query: z.string().min(1).describe("Search query"),
});

export type SearchWebInput = z.infer<typeof searchWebInput>;

export type SearchWebOutput = {
  query: string;
  results: Array<{
    snippet: string;
    title: string;
  }>;
};

export default defineTool({
  description:
    "Search the web for topical information. Use before rendering result lists or research summaries.",
  inputSchema: searchWebInput,
  execute({ query }): SearchWebOutput {
    return {
      query,
      results: [
        {
          title: `Top result for "${query}"`,
          snippet: `Comprehensive overview of ${query} with the latest information.`,
        },
        {
          title: `${query} - Latest News`,
          snippet: `Recent developments and updates related to ${query}.`,
        },
        {
          title: `Understanding ${query}`,
          snippet: `An in-depth guide explaining everything about ${query}.`,
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
