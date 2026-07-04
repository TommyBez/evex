import { defineState } from "eve/context";

// Evidence is recorded by the record-check-evidence hook from actual
// run_eve_cli results, so the model cannot write it — only relay it.
export type CheckKind = "build" | "eval" | "info";

export interface CheckEvidence {
  command: string;
  exitCode: number;
}

export interface DeliveryEvidence {
  checks: Partial<Record<CheckKind, CheckEvidence>>;
}

export const deliveryEvidence = defineState<DeliveryEvidence>(
  "eve-agent-builder.delivery-evidence",
  () => ({ checks: {} })
);

const EVE_INFO_COMMAND = /\beve\s+info\b/;
const EVE_BUILD_COMMAND = /\beve\s+build\b/;
const EVE_EVAL_COMMAND = /\beve\s+eval\b/;

export function classifyEveCommand(command: string): CheckKind | undefined {
  if (EVE_INFO_COMMAND.test(command)) {
    return "info";
  }
  if (EVE_BUILD_COMMAND.test(command)) {
    return "build";
  }
  if (EVE_EVAL_COMMAND.test(command)) {
    return "eval";
  }
  return undefined;
}

const CHECK_ORDER: readonly CheckKind[] = ["info", "build", "eval"];

export function renderEvidenceMarkdown(evidence: DeliveryEvidence): string {
  const lines = CHECK_ORDER.map((kind) => {
    const check = evidence.checks[kind];
    if (!check) {
      return `- eve ${kind}: not run this session`;
    }
    const status = check.exitCode === 0 ? "passed" : "FAILED";
    return `- eve ${kind}: ${status} (exit ${check.exitCode}, \`${check.command}\`)`;
  });

  return lines.join("\n");
}
