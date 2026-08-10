import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";
import { getSlackChannelId, linearOperationsConfig } from "../lib/linear-operations-config.js";

export default defineSchedule({
  cron: linearOperationsConfig.schedules.cycleHealth,
  async run({ receive, waitUntil, appAuth }) {
    const channelId = getSlackChannelId("cycle");
    if (!channelId) return;

    waitUntil(
      receive(slack, {
        auth: appAuth,
        target: { channelId },
        message:
          "Run the Linear cycle health report for configured teams and current cycles. Check blocked issues, stale P0/P1 issues, owner overload, work added after the cycle started, scope creep, and completed work not closed. Deliver the operational report to Slack. Do not apply Linear updates automatically.",
      }),
    );
  },
});
