import type { InboundLeadConfig } from "./lead-config";
import type { EnrichedLead } from "./enrich";

export const ICP_BANDS = ["hot", "warm", "cold", "unscored"] as const;

export type IcpBand = (typeof ICP_BANDS)[number];

export type IcpScore = {
  readonly score: number;
  readonly band: IcpBand;
  readonly reasons: readonly string[];
  readonly hot: boolean;
};

const TITLE_HINTS = [
  "founder",
  "ceo",
  "cto",
  "cmo",
  "vp",
  "director",
  "head of",
  "growth",
  "demand",
  "revenue",
];

export function scoreIcp(
  enriched: EnrichedLead,
  config: Pick<InboundLeadConfig, "icp">,
): IcpScore {
  if (enriched.looksLikeInstructions) {
    return {
      score: 0,
      band: "unscored",
      reasons: [
        "Lead fields looked like instructions. Scoring stayed fail-closed.",
      ],
      hot: false,
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const title = (enriched.lead.title ?? "").toLowerCase();
  const company = enriched.company.toLowerCase();
  const haystack = `${title} ${company} ${enriched.lead.message ?? ""}`.toLowerCase();

  if (enriched.workEmail) {
    score += 30;
    reasons.push("Work email domain.");
  }

  if (config.icp.domains.includes(enriched.domain)) {
    score += 40;
    reasons.push("Email domain matches the configured ICP list.");
  }

  const titleMatch = config.icp.titles.some((item) => title.includes(item));
  if (titleMatch) {
    score += 20;
    reasons.push("Job title matches the configured ICP list.");
  } else if (TITLE_HINTS.some((hint) => title.includes(hint))) {
    score += 10;
    reasons.push("Job title matches a buyer-role heuristic.");
  }

  const keywordMatch = config.icp.keywords.some((item) => haystack.includes(item));
  if (keywordMatch) {
    score += 10;
    reasons.push("Company or message matches an ICP keyword.");
  }

  const clamped = Math.min(100, score);
  const hot = clamped >= config.icp.hotThreshold;
  const band: IcpBand = hot
    ? "hot"
    : clamped >= Math.max(40, Math.floor(config.icp.hotThreshold / 2))
      ? "warm"
      : "cold";

  return {
    score: clamped,
    band,
    reasons,
    hot,
  };
}

export function isHotBand(band: string | undefined): boolean {
  return band === "hot";
}
