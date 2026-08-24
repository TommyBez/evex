const REPRO_HINTS =
  /\b(repro(duce|duction)?|steps to reproduce|to reproduce|minimal example|repro steps)\b/i;
const EXPECTED_HINTS =
  /\b(expected|should (have|be|show|return)|i expected|expected behavior)\b/i;
const ACTUAL_HINTS =
  /\b(actual|instead|got|observed|currently|what happens|error|stack trace|traceback)\b/i;
const ENVIRONMENT_HINTS =
  /\b(environment|node|npm|pnpm|browser|os|macos|linux|windows|version|chrome|firefox|safari|ios|android)\b/i;

const BUG_LIKE_HINTS =
  /\b(bug|broken|crash|crashes|error|exception|fail(s|ed|ure)?|regression|doesn'?t work|does not work|incorrect|wrong|stack trace|traceback|typeerror|nullpointer)\b/i;
const NON_BUG_HINTS =
  /\b(feature request|enhancement|docs?|documentation|typo|readme|how (do|can|to)|question|chore|dependency|dependencies|upgrade|bump)\b/i;

export type ThinIssueGaps = {
  readonly missingEnvironment: boolean;
  readonly missingExpectedVsActual: boolean;
  readonly missingRepro: boolean;
};

export function detectThinIssueGaps(
  body: string | null | undefined,
): ThinIssueGaps {
  const text = body?.trim() ?? "";
  if (text.length === 0) {
    return {
      missingRepro: true,
      missingExpectedVsActual: true,
      missingEnvironment: true,
    };
  }

  const hasRepro = REPRO_HINTS.test(text);
  const hasExpected = EXPECTED_HINTS.test(text);
  const hasActual = ACTUAL_HINTS.test(text);
  const hasEnvironment = ENVIRONMENT_HINTS.test(text);

  return {
    missingRepro: !hasRepro,
    missingExpectedVsActual: !(hasExpected && hasActual),
    missingEnvironment: !hasEnvironment,
  };
}

/**
 * Thin-report requirements apply only to bug-like issues. Feature, docs,
 * question, and chore reports should not be flagged just for missing repro
 * keywords.
 */
export function looksBugLike(
  title: string | null | undefined,
  body: string | null | undefined,
): boolean {
  const text = `${title ?? ""}\n${body ?? ""}`.trim();
  if (text.length === 0) {
    return false;
  }

  if (BUG_LIKE_HINTS.test(text)) {
    return true;
  }

  if (NON_BUG_HINTS.test(text)) {
    return false;
  }

  // Ambiguous short reports with no taxonomy signal are treated as bug-like
  // so drive-by "it doesnt work" issues still get a repro ask after labeling.
  return text.length < 80;
}

export function isThinIssue(
  gaps: ThinIssueGaps,
  options: { readonly bugLike: boolean },
): boolean {
  if (!options.bugLike) {
    return false;
  }

  return (
    gaps.missingRepro ||
    gaps.missingExpectedVsActual ||
    gaps.missingEnvironment
  );
}

export function formatReproRequest(gaps: ThinIssueGaps): string {
  const missing: string[] = [];
  if (gaps.missingRepro) {
    missing.push("steps to reproduce (numbered, minimal)");
  }
  if (gaps.missingExpectedVsActual) {
    missing.push("expected behavior vs what actually happens");
  }
  if (gaps.missingEnvironment) {
    missing.push(
      "environment (OS, runtime/browser versions, package versions)",
    );
  }

  return [
    "Thanks for opening this issue. To triage it accurately, please add:",
    ...missing.map((item) => `- ${item}`),
    "",
    "A short, self-contained repro helps maintainers act faster. Reply on this thread with the missing details.",
  ].join("\n");
}
