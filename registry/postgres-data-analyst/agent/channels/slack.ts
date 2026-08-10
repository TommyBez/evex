import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

const SLACK_CONNECT_UID =
  process.env.DATA_ANALYST_SLACK_CONNECT_UID || "slack/postgres-data-analyst";

export default slackChannel({
  credentials: connectSlackCredentials(SLACK_CONNECT_UID),
});
