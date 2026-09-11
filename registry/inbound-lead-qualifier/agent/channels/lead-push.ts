import { defineChannel, POST } from "eve/channels";

import { inboundLeadConfig } from "../lib/lead-config";
import { parseLeadEvent } from "../lib/lead-events";
import { authorizeLeadPush } from "../lib/push-auth";
import {
  buildPushQualifyPrompt,
  persistPushLead,
} from "../lib/push-inbox";

export default defineChannel({
  routes: [
    POST("/leads/push", async (request, { from, waitUntil }) => {
      let rawBody = "";
      let body: unknown = {};
      try {
        rawBody = await request.text();
        body = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        body = {};
      }

      const auth = authorizeLeadPush({
        request,
        rawBody,
        body,
        expectedSecret: inboundLeadConfig.pushWebhookSecret,
      });
      if (!auth.authorized) {
        return new Response("Unauthorized", { status: 401 });
      }

      const parsed = parseLeadEvent({ body });
      if ("ignored" in parsed) {
        return Response.json(
          { accepted: false, emailedLead: false },
          { status: 202 },
        );
      }

      const leadId = persistPushLead(parsed.lead);
      waitUntil(
        from(`lead:${parsed.source}`).send(
          buildPushQualifyPrompt(parsed.lead, leadId),
          {
            auth: {
              authenticator: "lead-push",
              principalType: "service",
              principalId: `lead-push:${parsed.source}`,
              attributes: {
                source: parsed.source,
                reason: parsed.reason,
                leadId,
                ...(parsed.lead.id ? { inboundLeadId: parsed.lead.id } : {}),
              },
            },
          },
        ),
      );

      return Response.json(
        {
          accepted: true,
          emailedLead: false,
          reason: "push",
          source: parsed.source,
          leadId,
        },
        { status: 202 },
      );
    }),
  ],
});
