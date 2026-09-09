import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

const SLACK_CONNECT_UID =
  process.env.INVOICE_CHASE_SLACK_CONNECT_UID || "slack/invoice-chase-drafter";

export default slackChannel({
  credentials: connectSlackCredentials(SLACK_CONNECT_UID),
});
