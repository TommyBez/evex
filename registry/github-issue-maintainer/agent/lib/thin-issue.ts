const REPRO_HINTS =
  /\b(repro(duce|duction)?|steps to reproduce|to reproduce|minimal example|repro steps)\b/i;
const EXPECTED_HINTS =
  /\b(expected|should (have|be|show|return)|i expected|expected behavior)\b/i;
const ACTUAL_HINTS =
  /\b(actual|instead|got|observed|currently|what happens|error|stack trace|traceback)\b/i;
const ENVIRONMENT_HINTS =
  /\b(environment|node|npm|pnpm|browser|os|macos|linux|windows|version|chrome|firefox|safari|ios|android)\b/i;

export type ThinIssueGaps = {
  readonly missingEnvironment: boolean;
  readonly missingExpectedVsActual: boolean;
  readonly missingRepro: boolean;
};

export function detectThinIssueGaps(body: string | null | undefined): ThinIssueGaps {
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

export function isThinIssue(gaps: ThinIssueGaps): boolean {
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
    missing.push("environment (OS, runtime/browser versions, package versions)");
  }

  return [
    "Thanks for opening this issue. To triage it accurately, please add:",
    ...missing.map((item) => `- ${item}`),
    "",
    "A short, self-contained repro helps maintainers act faster. Reply on this thread with the missing details.",
  ].join("\n");
}
