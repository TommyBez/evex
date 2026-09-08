import { defineChannel, GET, POST } from "eve/channels";

import { emailTriageConfig } from "../lib/email-config";
import { parsePushEvent } from "../lib/push-events";
import { readWebhookSecret, webhookSecretsMatch } from "../lib/webhook-auth";

const TRIAGE_PROMPT = `A mailbox push notification arrived. Run inbox triage now.

1. Call load_inbox_config. If notConfigured is true, stop and report the missing env. Do not invent threads.
2. Call ingest_push_event with source matching the provider when you know it.
3. Call list_inbox_threads, then read_thread on threads that need a human reply.
4. Call sample_sent_style and write each reply in that voice.
5. Call apply_triage_bucket with one configured bucket.
6. Call create_draft_reply with intent draft only. The tool writes Drafts and always returns sent false.
7. If EMAIL_TRIAGE_SLACK_WEBHOOK_URL is configured and at least one draft was written, call notify_slack_drafts_ready.

Never send mail. Never call SMTP. Never claim a draft was delivered.`;

export default defineChannel({
  routes: [
    GET("/inbox/push", async (request) => {
      const parsed = parsePushEvent({
        searchParams: new URL(request.url).searchParams,
      });
      if ("validationToken" in parsed) {
        return new Response(parsed.validationToken, {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
      return new Response("Method not allowed", { status: 405 });
    }),
    POST("/inbox/push", async (request, { from, waitUntil }) => {
      const searchParams = new URL(request.url).searchParams;
      const handshake = parsePushEvent({ searchParams });
      if ("validationToken" in handshake) {
        return new Response(handshake.validationToken, {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      if (
        !webhookSecretsMatch(
          readWebhookSecret(request),
          emailTriageConfig.pushWebhookSecret,
        )
      ) {
        return new Response("Unauthorized", { status: 401 });
      }

      let body: unknown = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }

      const parsed = parsePushEvent({ searchParams, body });
      if ("validationToken" in parsed) {
        return new Response(parsed.validationToken, {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
      if ("ignored" in parsed) {
        return Response.json({ accepted: false, sent: false }, { status: 202 });
      }

      const address = `inbox:${parsed.source}`;
      waitUntil(
        from(address).send(TRIAGE_PROMPT, {
          auth: {
            authenticator: "inbox-push",
            principalType: "service",
            principalId: `inbox-push:${parsed.source}`,
            attributes: { source: parsed.source, reason: parsed.reason },
          },
        }),
      );

      return Response.json(
        { accepted: true, sent: false, reason: "push", source: parsed.source },
        { status: 202 },
      );
    }),
  ],
});
