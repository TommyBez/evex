import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

const SLACK_CONNECT_UID =
  process.env.EMAIL_TRIAGE_SLACK_CONNECT_UID || "slack/email-triage-assistant";

export default slackChannel({
  credentials: connectSlackCredentials(SLACK_CONNECT_UID),
});
