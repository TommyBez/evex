import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";
import {
  getSlackChannelId,
  linearOperationsConfig,
} from "../lib/linear-operations-config.js";

const getEnabledInitiatives = () =>
  linearOperationsConfig.coveredInitiatives.filter((initiative) => initiative.weeklyUpdateEnabled);

export default defineSchedule({
  cron: linearOperationsConfig.schedules.weeklyInitiativeUpdates,
  async run({ receive, waitUntil, appAuth }) {
    const initiatives = getEnabledInitiatives();
    if (initiatives.length === 0) return;

    for (const initiative of initiatives) {
      const channelId = initiative.slackChannelId ?? getSlackChannelId("default");
      if (!channelId) continue;

      waitUntil(
        receive(slack, {
          auth: appAuth,
          target: { channelId },
          message: [
            "Create a weekly Linear initiative update for this explicitly configured initiative only.",
            `Configured initiative: ${initiative.idOrName}.`,
            "Analyze related issues, projects, recent completions, open work, blockers, risks, dependencies, pending decisions, scope changes, and recommended next steps.",
            'Write the final update directly to Linear with save_status_update({ type: "initiative" }).',
            "If Linear reports that roadmaps or initiatives are not enabled in this workspace, post a clear Slack error to this configured channel instead of producing a generic digest.",
          ].join("\n"),
        }),
      );
    }
  },
});
