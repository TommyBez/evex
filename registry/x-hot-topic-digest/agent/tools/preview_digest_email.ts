import { defineTool } from "eve/tools";
import { z } from "zod";

import { hotTopicConfig } from "../lib/hot-topic-config.js";

export default defineTool({
  description:
    "Preview the X hot topic digest email without sending it. Resolves recipients and sender from configuration and returns the exact payload that send_digest_email would send. Recipients and sender come from configuration and cannot be overridden via input.",
  inputSchema: z.object({
    subject: z.string().min(1).optional(),
    html: z.string().min(1),
  }),
  async execute({ subject, html }) {
    const resolvedFrom = hotTopicConfig.digest.from;
    if (!resolvedFrom) {
      return { notConfigured: true, missingEnv: "X_HOT_TOPIC_DIGEST_FROM" };
    }

    const resolvedTo = hotTopicConfig.digest.to;
    if (resolvedTo.length === 0) {
      return { notConfigured: true, missingEnv: "X_HOT_TOPIC_DIGEST_TO" };
    }

    return {
      dryRun: true,
      from: resolvedFrom,
      to: resolvedTo,
      subject: subject ?? hotTopicConfig.digest.subject,
      htmlPreview: html.slice(0, 500),
      htmlLength: html.length,
    };
  },
});
