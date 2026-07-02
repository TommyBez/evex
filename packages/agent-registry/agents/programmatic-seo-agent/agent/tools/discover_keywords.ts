import { defineTool } from "eve/tools";
import { z } from "zod";

import { dataForSeoPost, readDataForSeoCredentials } from "../lib/dataforseo.js";
import { pseoConfig } from "../lib/pseo-config.js";

const MAX_SEED_KEYWORDS = 10;
const MAX_IDEAS = 200;

type KeywordIdeaItem = {
  keyword?: string;
  keyword_info?: {
    search_volume?: number | null;
    cpc?: number | null;
    competition_level?: string | null;
  };
  keyword_properties?: {
    keyword_difficulty?: number | null;
  };
  search_intent_info?: {
    main_intent?: string | null;
  };
};

type KeywordIdeasResult = {
  items?: KeywordIdeaItem[] | null;
};

export default defineTool({
  description:
    "Discover keyword ideas adjacent to the product with the DataForSEO Labs keyword_ideas endpoint. Returns keywords with search volume, difficulty, intent, and CPC, sorted by volume.",
  inputSchema: z.object({
    seedKeywords: z
      .array(z.string().min(1))
      .min(1)
      .max(MAX_SEED_KEYWORDS)
      .describe(
        "Seed keywords describing the product, its features, use cases, or audience.",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_IDEAS)
      .optional()
      .describe("Upper bound on returned keyword ideas. Defaults to 100."),
  }),
  async execute({ seedKeywords, limit }) {
    const credentials = readDataForSeoCredentials();
    if (!credentials) {
      return { authRequired: true, missingEnv: "DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD" };
    }

    const result = await dataForSeoPost(
      credentials,
      "/v3/dataforseo_labs/google/keyword_ideas/live",
      {
        keywords: seedKeywords,
        location_code: pseoConfig.locationCode,
        language_code: pseoConfig.languageCode,
        limit: limit ?? 100,
        order_by: ["keyword_info.search_volume,desc"],
      },
    );

    const items = ((result[0] as KeywordIdeasResult | undefined)?.items ?? []).filter(
      (item): item is KeywordIdeaItem => Boolean(item?.keyword),
    );

    return {
      seedKeywords,
      locationCode: pseoConfig.locationCode,
      languageCode: pseoConfig.languageCode,
      minSearchVolume: pseoConfig.minSearchVolume,
      keywordCount: items.length,
      keywords: items.map((item) => ({
        keyword: item.keyword,
        searchVolume: item.keyword_info?.search_volume ?? null,
        cpc: item.keyword_info?.cpc ?? null,
        competitionLevel: item.keyword_info?.competition_level ?? null,
        keywordDifficulty: item.keyword_properties?.keyword_difficulty ?? null,
        mainIntent: item.search_intent_info?.main_intent ?? null,
      })),
    };
  },
});
