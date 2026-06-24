import { connectSlackCredentials } from "@vercel/connect/eve";
import { defaultSlackAuth, loadThreadContextMessages, slackChannel } from "eve/channels/slack";

const SLACK_OPERATING_CONTEXT = [
  "Surface: Slack.",
  "Slack is intake, coordination, notification, and scheduled delivery.",
  "The final operational source of truth must live in Linear whenever work is created or changed.",
  "Before sensitive Linear changes, ask for approval in the originating Slack thread or move the final confirmation to Linear.",
].join("\n");

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required. Create a Vercel Connect Slack connector and set this to the returned connector UID.`,
    );
  }
  return value;
};

export default slackChannel({
  credentials: connectSlackCredentials(getRequiredEnv("SLACK_CONNECT_UID")),
  async onAppMention(ctx, message) {
    const auth = defaultSlackAuth(message, ctx);
    try {
      const priorMessages = await loadThreadContextMessages(ctx.thread, message, {
        since: "last-agent-reply",
      });

      const transcript = priorMessages
        .map(
          (threadMessage) =>
            `${threadMessage.isMe ? "agent" : (threadMessage.user ?? "user")}: ${threadMessage.markdown}`,
        )
        .join("\n");

      return {
        auth,
        context: transcript
          ? [SLACK_OPERATING_CONTEXT, `Recent Slack thread context since the last agent reply:\n\n${transcript}`]
          : [SLACK_OPERATING_CONTEXT],
      };
    } catch {
      return {
        auth,
        context: [SLACK_OPERATING_CONTEXT],
      };
    }
  },
  onDirectMessage: (ctx, message) => ({
    auth: defaultSlackAuth(message, ctx),
    context: [SLACK_OPERATING_CONTEXT],
  }),
});
