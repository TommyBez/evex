import { defineTool } from "eve/tools";
import { z } from "zod";

import { buildDigestDraft, buildDigestIdempotencyKey, utcDateStamp } from "../lib/digest.js";
import { selectDigestAlerts } from "../lib/thresholds.js";
import { isSlackDeliveryConfigured, watchConfig } from "../lib/watch-config.js";

const changeSchema = z.object({
  url: z.string().url(),
  fetchedAt: z.string().min(1),
  isBaseline: z.boolean(),
  changed: z.boolean(),
  score: z.number().min(0).max(100),
  changedChars: z.number().min(0),
  excerpt: z.string(),
  clearsThreshold: z.boolean(),
});

export default defineTool({
  description:
    "Preview the Slack and/or email digest without sending it. Rebuilds eligibility from score, changedChars, and the configured alert thresholds. Recipients and Slack Connect settings come from configuration and cannot be overridden via input. Returns the idempotencyKey and runDate to pass into every send_digest call, including retries of this logical digest.",
  inputSchema: z.object({
    changes: z.array(changeSchema).min(1),
    runDate: z.string().min(1).optional(),
  }),
  execute({ changes, runDate }) {
    const alerts = selectDigestAlerts(changes, watchConfig.alert);
    if (alerts.length === 0) {
      return {
        dryRun: true,
        nothingToDeliver: true,
        note: "No changes cleared the alert thresholds. Do not call send_digest.",
      };
    }

    const slackConfigured = isSlackDeliveryConfigured(watchConfig);
    const emailConfigured = Boolean(watchConfig.digest.from && watchConfig.digest.to.length > 0);
    if (!slackConfigured && !emailConfigured) {
      return {
        dryRun: true,
        notConfigured: true,
        missingEnv: [
          "COMPETITOR_INTEL_SLACK_CONNECT_UID",
          "COMPETITOR_INTEL_SLACK_CHANNEL_ID",
          "COMPETITOR_INTEL_DIGEST_FROM",
          "COMPETITOR_INTEL_DIGEST_TO",
        ],
      };
    }

    const date = runDate ?? utcDateStamp();
    const draft = buildDigestDraft(alerts, watchConfig, date);
    return {
      dryRun: true,
      nothingToDeliver: false,
      changeCount: draft.changeCount,
      subject: draft.subject,
      slackConfigured,
      emailConfigured,
      emailTo: watchConfig.digest.to,
      slackTextPreview: draft.slackText.slice(0, 500),
      htmlPreview: draft.html.slice(0, 500),
      htmlLength: draft.html.length,
      textLength: draft.text.length,
      runDate: date,
      idempotencyKey: buildDigestIdempotencyKey(alerts, date),
      draft,
    };
  },
});
