import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

const SLACK_CONNECT_UID =
  process.env.COMPETITOR_INTEL_SLACK_CONNECT_UID || "slack/competitor-intel-monitor";

export default slackChannel({
  credentials: connectSlackCredentials(SLACK_CONNECT_UID),
});
