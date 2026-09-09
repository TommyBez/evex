import { createHash } from "node:crypto";

import type { CrmHygieneConfig } from "./crm-config";
import type { HygieneBatch, HygieneProposal } from "./hygiene";

export type DigestDraft = {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly slackText: string;
  readonly proposalCount: number;
};

export const utcDateStamp = (now = new Date()): string =>
  now.toISOString().slice(0, 10);

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const proposalLine = (proposal: HygieneProposal): string => {
  const merge = proposal.mergeRecordId
    ? ` merge ${proposal.mergeRecordId} into ${proposal.recordId}`
    : ` ${proposal.recordId}`;
  return `${proposal.kind}${merge} — ${proposal.reason}`;
};

export const buildDigestIdempotencyKey = (
  batch: HygieneBatch,
  runDate: string,
): string => {
  const digest = createHash("sha256")
    .update(batch.batchId)
    .update(runDate)
    .digest("hex")
    .slice(0, 16);
  return `crm-hygiene-agent-${runDate}-${digest}`;
};

export const buildDigestDraft = (
  batch: HygieneBatch,
  config: Pick<CrmHygieneConfig, "digest">,
  runDate: string,
): DigestDraft => {
  const subject = `${config.digest.subject} — ${runDate}`;
  const intro =
    batch.proposals.length === 0
      ? `CRM hygiene scan on ${runDate} found no dedupe, normalize, or enrich work.`
      : `${batch.proposals.length} proposed CRM ${
          batch.proposals.length === 1 ? "change" : "changes"
        } on ${runDate}. Nothing has been written. Approve apply_hygiene_writes before any CRM mutation.`;

  const rows = batch.proposals
    .map((proposal) => {
      return `<tr>
  <td>${escapeHtml(proposal.kind)}</td>
  <td>${escapeHtml(proposal.recordId)}</td>
  <td>${escapeHtml(proposal.mergeRecordId ?? "")}</td>
  <td>${escapeHtml(proposal.reason)}</td>
</tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body>
    <div lang="en" dir="ltr">
      <h1>${escapeHtml(subject)}</h1>
      <p>${escapeHtml(intro)}</p>
      <p>Batch ${escapeHtml(batch.batchId)} scanned ${batch.recordCount} records. Writes stay staged until you approve.</p>
      <table>
        <thead>
          <tr>
            <th>Kind</th>
            <th>Record</th>
            <th>Merge</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
  </body>
</html>`;

  const text = [
    intro,
    `Batch ${batch.batchId}`,
    ...batch.proposals.map((proposal) => proposalLine(proposal)),
  ].join("\n\n");
  const slackText = [
    `CRM hygiene batch (${runDate})`,
    intro,
    ...batch.proposals.map((proposal) => `• ${proposalLine(proposal)}`),
  ].join("\n");

  return {
    subject,
    html,
    text,
    slackText,
    proposalCount: batch.proposals.length,
  };
};
