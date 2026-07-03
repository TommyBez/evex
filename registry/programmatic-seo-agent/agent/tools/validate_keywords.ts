import { defineTool } from "eve/tools";
import { z } from "zod";

import { dataForSeoPost, readDataForSeoCredentials } from "../lib/dataforseo.js";
import { pseoConfig } from "../lib/pseo-config.js";

const MAX_KEYWORDS_PER_CALL = 200;

type SearchVolumeResult = {
  keyword?: string;
  search_volume?: number | null;
  cpc?: number | null;
  competition?: number | null;
};

export default defineTool({
  description:
    "Validate an explicit list of candidate keywords (for example template permutations like '<product> for <persona>') against real Google Ads search volumes via DataForSEO. Use this before committing to a page pattern.",
  inputSchema: z.object({
    keywords: z
      .array(z.string().min(1))
      .min(1)
      .max(MAX_KEYWORDS_PER_CALL)
      .describe("Exact candidate keywords to validate."),
  }),
  async execute({ keywords }) {
    const credentials = readDataForSeoCredentials();
    if (!credentials) {
      return { authRequired: true, missingEnv: "DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD" };
    }

    const result = (await dataForSeoPost(
      credentials,
      "/v3/keywords_data/google_ads/search_volume/live",
      {
        keywords,
        location_code: pseoConfig.locationCode,
        language_code: pseoConfig.languageCode,
      },
    )) as SearchVolumeResult[];

    const validated = result
      .filter((entry): entry is SearchVolumeResult => Boolean(entry?.keyword))
      .map((entry) => ({
        keyword: entry.keyword,
        searchVolume: entry.search_volume ?? 0,
        cpc: entry.cpc ?? null,
        competition: entry.competition ?? null,
        meetsMinVolume: (entry.search_volume ?? 0) >= pseoConfig.minSearchVolume,
      }));

    return {
      minSearchVolume: pseoConfig.minSearchVolume,
      requestedCount: keywords.length,
      validatedCount: validated.length,
      aboveThresholdCount: validated.filter((entry) => entry.meetsMinVolume).length,
      keywords: validated,
    };
  },
});
