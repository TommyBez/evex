import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  isSlackDeliveryConfigured,
  missingDeliveryEnv,
} from "../lib/renewal-config";
import {
  buildDigestDraft,
  buildDigestIdempotencyKey,
} from "../lib/digest";
import { utcDateStamp, type ScoreBatch } from "../lib/score";

const accountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ownerName: z.string().optional(),
  ownerEmail: z.string().optional(),
  renewalDate: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  domain: z.string().optional(),
});

const scoredSchema = z.object({
  account: accountSchema,
  bucket: z.enum(["healthy", "watch", "at-risk"]),
  previousBucket: z.enum(["healthy", "watch", "at-risk"]).optional(),
  moved: z.boolean(),
  reasons: z.array(z.string()),
  failClosed: z.literal(false),
});

export default defineTool({
  description:
    "Preview the Slack movers digest for a scored renewal batch without posting it and without writing to the CRM. Returns the idempotencyKey and runDate to pass into deliver_renewal_digest.",
  inputSchema: z.object({
    batch: z.object({
      batchId: z.string().min(1),
      provider: z.string().min(1),
      scannedAt: z.string().min(1),
      scored: z.array(scoredSchema),
      skipped: z.array(
        z.object({
          account: accountSchema,
          failClosed: z.literal(true),
          note: z.string().min(1),
        }),
      ),
      movers: z.array(scoredSchema),
    }),
    runDate: z.string().min(1).optional(),
  }),
  execute({ batch, runDate }) {
    if (!isSlackDeliveryConfigured()) {
      return {
        dryRun: true,
        notConfigured: true,
        written: false,
        emailedCustomer: false,
        missingEnv: missingDeliveryEnv(),
      };
    }

    const date = runDate ?? utcDateStamp();
    const draft = buildDigestDraft(batch as ScoreBatch, { runDate: date });
    return {
      dryRun: true,
      written: false,
      emailedCustomer: false,
      nothingToDeliver: draft.moverCount === 0,
      moverCount: draft.moverCount,
      skippedCount: draft.skippedCount,
      subject: draft.subject,
      slackTextPreview: draft.slackText.slice(0, 500),
      runDate: date,
      idempotencyKey: buildDigestIdempotencyKey(date),
    };
  },
});
