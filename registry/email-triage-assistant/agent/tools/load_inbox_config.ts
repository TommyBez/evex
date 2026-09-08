import { defineTool } from "eve/tools";
import { z } from "zod";

import { emailTriageConfig, missingEmailProviderEnv } from "../lib/email-config";

export default defineTool({
  description:
    "Load the configured mailbox provider, cron, triage buckets, and whether Slack or push is set. Does not return secrets. Call this first on a scheduled or push run.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingEmailProviderEnv();
    return {
      provider: emailTriageConfig.provider,
      cron: emailTriageConfig.cron,
      buckets: emailTriageConfig.buckets,
      sentSampleSize: emailTriageConfig.sentSampleSize,
      maxThreads: emailTriageConfig.maxThreads,
      slackConfigured: Boolean(emailTriageConfig.slackWebhookUrl),
      pushConfigured: Boolean(emailTriageConfig.pushWebhookSecret),
      missingEnv: missing,
      notConfigured: missing.length > 0,
      sent: false,
    };
  },
});
