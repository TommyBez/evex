import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";
import { getSlackChannelId, linearOperationsConfig } from "../lib/linear-operations-config.js";

export default defineSchedule({
  cron: linearOperationsConfig.schedules.weeklyBacklogHygiene,
  async run({ receive, waitUntil, appAuth }) {
    const channelId = getSlackChannelId("backlog");
    if (!channelId) return;

    waitUntil(
      receive(slack, {
        auth: appAuth,
        target: { channelId },
        message:
          "Run weekly Linear backlog hygiene in proposal-only mode. Find stale, probably obsolete, duplicate, ownerless, priorityless, and under-specified issues. Group findings and propose concrete cleanup actions. Do not close, archive, reprioritize, or bulk update issues without approval.",
      }),
    );
  },
});
