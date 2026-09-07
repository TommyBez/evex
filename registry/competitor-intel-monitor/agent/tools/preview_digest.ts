import { defineTool } from "eve/tools";
import { z } from "zod";

import { buildDigestDraft, utcDateStamp } from "../lib/digest.js";
import { watchConfig } from "../lib/watch-config.js";

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
    "Preview the Slack and/or email digest without sending it. Builds a scored draft from changes that already cleared the alert thresholds. Recipients and the Slack webhook come from configuration and cannot be overridden via input.",
  inputSchema: z.object({
    changes: z.array(changeSchema).min(1),
    runDate: z.string().min(1).optional(),
  }),
  execute({ changes, runDate }) {
    const alerts = changes.filter((change) => change.clearsThreshold && !change.isBaseline);
    if (alerts.length === 0) {
      return {
        dryRun: true,
        nothingToDeliver: true,
        note: "No changes cleared the alert thresholds. Do not call send_digest.",
      };
    }

    const slackConfigured = Boolean(watchConfig.slackWebhookUrl);
    const emailConfigured = Boolean(watchConfig.digest.from && watchConfig.digest.to.length > 0);
    if (!slackConfigured && !emailConfigured) {
      return {
        dryRun: true,
        notConfigured: true,
        missingEnv: [
          "COMPETITOR_INTEL_SLACK_WEBHOOK_URL",
          "COMPETITOR_INTEL_DIGEST_FROM",
          "COMPETITOR_INTEL_DIGEST_TO",
        ],
      };
    }

    const draft = buildDigestDraft(alerts, watchConfig, runDate ?? utcDateStamp());
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
      draft,
    };
  },
});
