import { defineTool } from "eve/tools";
import { z } from "zod";

import { issueDigestConfig } from "../lib/issue-config";

export default defineTool({
  description:
    "Preview the weekly open-issue digest email without sending it. Recipients and sender come from configuration and cannot be overridden via input.",
  inputSchema: z.object({
    subject: z.string().min(1).optional(),
    html: z.string().min(1),
  }),
  async execute({ subject, html }) {
    const resolvedFrom = issueDigestConfig.from;
    if (!resolvedFrom) {
      return { notConfigured: true, missingEnv: "ISSUE_DIGEST_FROM" };
    }

    const resolvedTo = issueDigestConfig.to;
    if (resolvedTo.length === 0) {
      return { notConfigured: true, missingEnv: "ISSUE_DIGEST_TO" };
    }

    return {
      dryRun: true,
      from: resolvedFrom,
      to: resolvedTo,
      subject: subject ?? issueDigestConfig.subject,
      htmlPreview: html.slice(0, 500),
      htmlLength: html.length,
    };
  },
});
