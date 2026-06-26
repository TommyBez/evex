import { Resend } from "resend";
import { defineTool } from "eve/tools";
import { z } from "zod";

import { hotTopicConfig } from "../lib/hot-topic-config.js";

// Successful sends are cached so a replayed Eve step returns the recorded
// result instead of issuing a second send. Failures are not cached so they
// can be retried with the same idempotency key.
const sentKeys = new Map<
  string,
  { readonly to: readonly string[]; readonly messageId: string }
>();

const payloadSchema = z.object({
  subject: z.string().min(1).optional(),
  html: z.string().min(1),
  confirmSend: z
    .boolean()
    .describe(
      "Must be true to send. Acts as an explicit guard against accidental sends.",
    ),
  idempotencyKey: z
    .string()
    .min(1)
    .max(255)
    .describe(
      "Stable unique key for this digest. Reused across retries of the same step so a replayed send does not duplicate the email.",
    ),
});

export default defineTool({
  description:
    "Send the X hot topic digest email through Resend to the configured recipients. Requires an explicit confirmSend flag and a stable idempotencyKey so a replayed step never duplicates the email. Recipients and sender come from configuration and cannot be overridden via input. Always call preview_digest_email first.",
  inputSchema: payloadSchema,
  async execute({ subject, html, confirmSend, idempotencyKey }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "RESEND_API_KEY" };
    }

    if (!confirmSend) {
      return {
        notConfirmed: true,
        note: "confirmSend must be true to send. Call preview_digest_email to review the email first.",
      };
    }

    const resolvedFrom = hotTopicConfig.digest.from;
    if (!resolvedFrom) {
      return { notConfigured: true, missingEnv: "X_HOT_TOPIC_DIGEST_FROM" };
    }

    const resolvedTo = hotTopicConfig.digest.to;
    if (resolvedTo.length === 0) {
      return { notConfigured: true, missingEnv: "X_HOT_TOPIC_DIGEST_TO" };
    }

    const cached = sentKeys.get(idempotencyKey);
    if (cached) {
      return { replayed: true, idempotencyKey, to: cached.to, messageId: cached.messageId };
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: resolvedFrom,
        to: resolvedTo,
        subject: subject ?? hotTopicConfig.digest.subject,
        html,
      },
      { idempotencyKey },
    );

    if (error) {
      return {
        sent: false,
        idempotencyKey,
        to: resolvedTo,
        error: { message: error.message, name: error.name },
      };
    }

    const messageId = data.id;
    sentKeys.set(idempotencyKey, { to: resolvedTo, messageId });
    return { sent: true, idempotencyKey, to: resolvedTo, messageId };
  },
});
