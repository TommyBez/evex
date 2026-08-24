import { Resend } from "resend";
import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  getWeeklyDigestIdempotencyKey,
  issueDigestConfig,
} from "../lib/issue-config";

const sentKeys = new Map<
  string,
  { readonly to: readonly string[]; readonly messageId: string }
>();

export default defineTool({
  description:
    "Send the weekly open-issue digest email through Resend. Requires confirmSend=true. The send uses a retry-stable ISO-week idempotency key (github-issue-digest-YYYY-Www) so retries after midnight in the same week never duplicate. Always call preview_digest_email first.",
  inputSchema: z.object({
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
      .optional()
      .describe(
        "Optional hint. The tool always pins the real send to the current ISO-week key.",
      ),
  }),
  async execute({ subject, html, confirmSend }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "RESEND_API_KEY" };
    }

    if (!confirmSend) {
      return {
        notConfirmed: true,
        note: "confirmSend must be true to send. Call preview_digest_email first.",
      };
    }

    const resolvedFrom = issueDigestConfig.from;
    if (!resolvedFrom) {
      return { notConfigured: true, missingEnv: "ISSUE_DIGEST_FROM" };
    }

    const resolvedTo = issueDigestConfig.to;
    if (resolvedTo.length === 0) {
      return { notConfigured: true, missingEnv: "ISSUE_DIGEST_TO" };
    }

    // Pin to ISO week so a retry after midnight cannot open a second send.
    const stableKey = getWeeklyDigestIdempotencyKey();

    const cached = sentKeys.get(stableKey);
    if (cached) {
      return {
        replayed: true,
        idempotencyKey: stableKey,
        to: cached.to,
        messageId: cached.messageId,
      };
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: resolvedFrom,
        to: [...resolvedTo],
        subject: subject ?? issueDigestConfig.subject,
        html,
      },
      { idempotencyKey: stableKey },
    );

    if (error) {
      return {
        sent: false,
        idempotencyKey: stableKey,
        to: resolvedTo,
        error: { message: error.message, name: error.name },
      };
    }

    const messageId = data?.id ?? "unknown";
    sentKeys.set(stableKey, { to: resolvedTo, messageId });
    return {
      sent: true,
      idempotencyKey: stableKey,
      to: resolvedTo,
      messageId,
    };
  },
});
