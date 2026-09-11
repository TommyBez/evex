import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

const SLACK_CONNECT_UID =
  process.env.INBOUND_LEAD_SLACK_CONNECT_UID || "slack/inbound-lead-qualifier";

export default slackChannel({
  credentials: connectSlackCredentials(SLACK_CONNECT_UID),
});
