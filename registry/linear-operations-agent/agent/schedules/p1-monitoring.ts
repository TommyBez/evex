import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";
import { getSlackChannelId, linearOperationsConfig } from "../lib/linear-operations-config.js";

export default defineSchedule({
  cron: linearOperationsConfig.schedules.p1Monitoring,
  async run({ to, waitUntil, appAuth }) {
    const channelId = getSlackChannelId("p1Monitoring");
    if (!channelId) return;

    waitUntil(
      to(slack, { channelId }).send(
        "Monitor Linear P0/P1 issues in read-only mode. Alert only on critical issues without recent updates, missing owner, unresolved blockers, or unclear next action. Do not change state or priority.",
        { auth: appAuth }
      ),
    );
  },
});
