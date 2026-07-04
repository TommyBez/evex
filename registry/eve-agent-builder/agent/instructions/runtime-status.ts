import { defineDynamic, defineInstructions } from "eve/instructions";
import {
  deliveryEvidence,
  renderEvidenceMarkdown,
} from "../lib/delivery-evidence";

// Resolved on every turn so long-lived sessions pick up credential changes
// after a redeploy. Reports presence only — never values — because this
// markdown becomes model context.
// Each check passes when any of its variables is present. The gateway model
// credential is satisfied by either AI_GATEWAY_API_KEY or a Vercel OIDC token
// from a linked project.
const READINESS_CHECKS = [
  {
    missing:
      "MISSING — the Vercel MCP connection, run_vercel_cli, and every deploy are blocked until it is set in the app runtime",
    names: ["VERCEL_TOKEN"],
  },
  {
    missing:
      "missing — local model calls need run_vercel_cli link_project to pull VERCEL_OIDC_TOKEN into .env.local",
    names: ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"],
  },
  {
    missing:
      "missing — protected Vercel previews cannot be verified; unprotected deployments still can",
    names: ["VERCEL_AUTOMATION_BYPASS_SECRET"],
  },
] as const;

function isPresent(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value !== "";
}

function renderReadiness(): string {
  const lines = READINESS_CHECKS.map((check) => {
    const presentName = check.names.find(isPresent);
    const label = check.names.join(" or ");
    const status = presentName ? `present (${presentName})` : check.missing;
    return `- ${label}: ${status}`;
  });

  return lines.join("\n");
}

function renderEvidence(): string {
  try {
    return renderEvidenceMarkdown(deliveryEvidence.get());
  } catch {
    return "- evidence unavailable this turn";
  }
}

export default defineDynamic({
  events: {
    "turn.started": () =>
      defineInstructions({
        markdown: [
          "# Runtime status (framework-resolved this turn; trust it over memory)",
          "## Environment readiness (presence only, never values)",
          renderReadiness(),
          "## Recorded delivery evidence (from actual run_eve_cli results this session)",
          renderEvidence(),
          "When requesting approval for a run_vercel_cli deploy action, quote the recorded delivery evidence in the `reason` field so the approver decides with facts. A repository edit made after a recorded check invalidates that check — rerun it.",
        ].join("\n\n"),
      }),
  },
});
