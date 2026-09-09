import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

const SLACK_CONNECT_UID =
  process.env.CRM_HYGIENE_SLACK_CONNECT_UID || "slack/crm-hygiene-agent";

export default slackChannel({
  credentials: connectSlackCredentials(SLACK_CONNECT_UID),
});
