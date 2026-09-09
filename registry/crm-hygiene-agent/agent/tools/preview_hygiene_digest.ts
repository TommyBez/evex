import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  isEmailDeliveryConfigured,
  isSlackDeliveryConfigured,
  missingDeliveryEnv,
  crmHygieneConfig,
} from "../lib/crm-config";
import {
  buildDigestDraft,
  buildDigestIdempotencyKey,
  utcDateStamp,
} from "../lib/digest";
import type { HygieneBatch } from "../lib/hygiene";

const proposalSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["dedupe", "normalize", "enrich"]),
  recordId: z.string().min(1),
  mergeRecordId: z.string().min(1).optional(),
  before: z.record(z.string(), z.unknown()),
  after: z.record(z.string(), z.unknown()),
  reason: z.string().min(1),
});

export default defineTool({
  description:
    "Preview the Slack and/or email digest for a proposed CRM hygiene batch without sending it and without writing to the CRM. Returns the idempotencyKey and runDate to pass into deliver_hygiene_digest.",
  inputSchema: z.object({
    batch: z.object({
      batchId: z.string().min(1),
      provider: z.string().min(1),
      scannedAt: z.string().min(1),
      recordCount: z.number().int().min(0),
      proposals: z.array(proposalSchema),
    }),
    runDate: z.string().min(1).optional(),
  }),
  execute({ batch, runDate }) {
    const slackConfigured = isSlackDeliveryConfigured();
    const emailConfigured = isEmailDeliveryConfigured();
    if (!slackConfigured && !emailConfigured) {
      return {
        dryRun: true,
        notConfigured: true,
        written: false,
        missingEnv: missingDeliveryEnv(),
      };
    }

    const date = runDate ?? utcDateStamp();
    const typedBatch = batch as HygieneBatch;
    const draft = buildDigestDraft(typedBatch, crmHygieneConfig, date);
    return {
      dryRun: true,
      written: false,
      nothingToDeliver: typedBatch.proposals.length === 0,
      proposalCount: draft.proposalCount,
      subject: draft.subject,
      slackConfigured,
      emailConfigured,
      slackTextPreview: draft.slackText.slice(0, 500),
      htmlPreview: draft.html.slice(0, 500),
      runDate: date,
      idempotencyKey: buildDigestIdempotencyKey(typedBatch, date),
      draft,
    };
  },
});
