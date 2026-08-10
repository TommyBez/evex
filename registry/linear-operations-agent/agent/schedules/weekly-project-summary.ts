import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";
import { getSlackChannelId, linearOperationsConfig } from "../lib/linear-operations-config.js";

export default defineSchedule({
  cron: linearOperationsConfig.schedules.weeklyProjectSummary,
  async run({ receive, waitUntil, appAuth }) {
    const channelId = getSlackChannelId("default");
    if (!channelId) return;

    waitUntil(
      receive(slack, {
        auth: appAuth,
        target: { channelId },
        message:
          "Run the weekly Linear project summary for configured projects. Summarize state, recent progress, completed issues, open work, blockers, risks, pending decisions, next steps, and scope changes. Deliver the report to Slack. Use Linear project/status update writes only when explicitly requested and approved.",
      }),
    );
  },
});
