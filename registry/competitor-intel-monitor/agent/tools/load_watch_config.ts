import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  isSlackDeliveryConfigured,
  missingWatchConfig,
  watchConfig,
} from "../lib/watch-config.js";
import { storeKind } from "../lib/snapshot-store.js";

export default defineTool({
  description:
    "Load the competitor watch list, cron, alert thresholds, store kind, and which delivery targets are configured. Does not return Slack Connect UIDs, API keys, or other secrets. Call this first on a scheduled run.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingWatchConfig(watchConfig);
    return {
      urls: watchConfig.urls,
      cron: watchConfig.cron,
      alert: watchConfig.alert,
      storeKind: storeKind(),
      storePath: watchConfig.storePath,
      userAgent: watchConfig.userAgent,
      delivery: {
        slackConfigured: isSlackDeliveryConfigured(watchConfig),
        emailConfigured: Boolean(watchConfig.digest.from && watchConfig.digest.to.length > 0),
        emailRecipientCount: watchConfig.digest.to.length,
        subject: watchConfig.digest.subject,
      },
      missingEnv: missing,
      notConfigured: missing.length > 0,
    };
  },
});
