import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

const SLACK_CONNECT_UID =
  process.env.CHURN_RENEWAL_SLACK_CONNECT_UID || "slack/churn-renewal-risk";

export default slackChannel({
  credentials: connectSlackCredentials(SLACK_CONNECT_UID),
});
