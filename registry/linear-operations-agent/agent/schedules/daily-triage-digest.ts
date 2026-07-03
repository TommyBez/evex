import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";
import { getSlackChannelId, linearOperationsConfig } from "../lib/linear-operations-config.js";

export default defineSchedule({
  cron: linearOperationsConfig.schedules.dailyTriageDigest,
  async run({ receive, waitUntil, appAuth }) {
    const channelId = getSlackChannelId("triage");
    if (!channelId) return;

    waitUntil(
      receive(slack, {
        auth: appAuth,
        target: { channelId },
        message:
          "Run the daily Linear triage digest in read-only mode. Highlight only issues that need attention: in triage too long, missing owner, missing priority, stale updates, likely duplicates, or blocked work. Deliver a concise Slack digest with concrete next steps. Do not modify Linear objects.",
      }),
    );
  },
});
