import { defineTool } from "eve/tools";
import { z } from "zod";

import { parsePushEvent } from "../lib/push-events";

export default defineTool({
  description:
    "Record an inbox push or webhook trigger (Gmail watch, Microsoft Graph subscription, or generic inbox.push). Returns that a mailbox triage run should start. Never sends mail.",
  inputSchema: z.object({
    source: z.enum(["gmail", "outlook", "generic"]).optional(),
    hint: z.string().max(200).optional(),
    payload: z.unknown().optional(),
  }),
  execute({ source, hint, payload }) {
    const parsed = parsePushEvent({ body: payload ?? { reason: "push" } });
    if ("validationToken" in parsed) {
      return {
        ingested: false,
        sent: false,
        note: "Graph validation tokens belong on the HTTP channel, not this tool.",
      };
    }
    if ("ignored" in parsed) {
      return {
        ingested: false,
        sent: false,
        note: "Payload was not an inbox push event.",
      };
    }

    return {
      ingested: true,
      sent: false,
      reason: "push",
      source: source ?? parsed.source,
      hint: hint ?? parsed.hint,
      next: "Run mailbox triage: load_inbox_config, list_inbox_threads, sample_sent_style, apply_triage_bucket, create_draft_reply.",
    };
  },
});
