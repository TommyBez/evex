import type { PageDiff } from "./page-diff.js";
import type { AlertThresholds } from "./watch-config.js";

export type ScoredChange = {
  readonly url: string;
  readonly fetchedAt: string;
  readonly isBaseline: boolean;
  readonly changed: boolean;
  readonly score: number;
  readonly changedChars: number;
  readonly excerpt: string;
  readonly clearsThreshold: boolean;
};

export const changeClearsThreshold = (
  diff: Pick<PageDiff, "score" | "changedChars" | "changed">,
  thresholds: AlertThresholds,
): boolean =>
  diff.changed &&
  diff.score >= thresholds.minScore &&
  diff.changedChars >= thresholds.minChangedChars;

export const toScoredChange = ({
  url,
  fetchedAt,
  isBaseline,
  diff,
  thresholds,
}: {
  url: string;
  fetchedAt: string;
  isBaseline: boolean;
  diff: PageDiff;
  thresholds: AlertThresholds;
}): ScoredChange => {
  if (isBaseline) {
    return {
      url,
      fetchedAt,
      isBaseline: true,
      changed: false,
      score: 0,
      changedChars: 0,
      excerpt: "First snapshot stored as the baseline.",
      clearsThreshold: false,
    };
  }

  const clearsThreshold = changeClearsThreshold(diff, thresholds);
  return {
    url,
    fetchedAt,
    isBaseline: false,
    changed: diff.changed,
    score: diff.score,
    changedChars: diff.changedChars,
    excerpt: diff.changed ? diff.excerpt : "No textual change against the stored snapshot.",
    clearsThreshold,
  };
};

export const changesThatClearThreshold = (
  changes: readonly ScoredChange[],
): readonly ScoredChange[] => changes.filter((change) => change.clearsThreshold);
