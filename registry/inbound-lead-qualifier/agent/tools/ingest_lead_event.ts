import { defineTool } from "eve/tools";
import { z } from "zod";

import { createCursorStore, isNewSinceCursor } from "../lib/cursor-store";
import {
  inboundLeadConfig,
  isCrmConfigured,
  isPushConfigured,
  isTypeformConfigured,
} from "../lib/lead-config";
import { parseLeadEvent, type LeadSource } from "../lib/lead-events";
import { createConfiguredCrmClient } from "../lib/providers/index";
import { createTypeformClient } from "../lib/providers/typeform";
import type { LeadFields } from "../lib/untrusted";

const ingestLeadEventInput = z.object({
  source: z.enum(["form", "typeform", "crm", "generic"]).optional(),
  payload: z.unknown().optional(),
  poll: z
    .boolean()
    .optional()
    .describe(
      "When true, or when payload is omitted on a cron run, poll Typeform and CRM new-since-cursor.",
    ),
});

export default defineTool({
  description:
    "Ingest a signed form or CRM webhook payload, or poll Typeform Connect and the CRM for leads newer than the cursor. Returns sanitized lead fields only. Never writes the CRM and never emails the lead.",
  inputSchema: ingestLeadEventInput,
  async execute({ source, payload, poll }) {
    const shouldPoll =
      poll === true || payload === undefined || !isPushConfigured();

    if (payload !== undefined) {
      const parsed = parseLeadEvent({
        body: payload,
        sourceHint: source,
      });
      if ("ignored" in parsed) {
        return {
          ingested: false,
          written: false,
          emailedLead: false,
          note: "Payload was not an inbound lead event.",
        };
      }
      rememberLeads([parsed.lead]);
      return {
        ingested: true,
        written: false,
        emailedLead: false,
        reason: parsed.reason,
        source: parsed.source,
        leads: [parsed.lead],
      };
    }

    if (!shouldPoll) {
      return {
        ingested: false,
        written: false,
        emailedLead: false,
        note: "No payload and poll was not requested.",
      };
    }

    const leads = await pollNewLeads(source);
    rememberLeads(leads);
    return {
      ingested: leads.length > 0,
      written: false,
      emailedLead: false,
      reason: "poll",
      source: source ?? (isTypeformConfigured() ? "typeform" : "crm"),
      leads,
    };
  },
});

function rememberLeads(leads: LeadFields[]): void {
  const store = createCursorStore(inboundLeadConfig.cursorPath);
  const ids: string[] = [];
  const timestamps: string[] = [];
  for (const lead of leads) {
    if (lead.id) {
      ids.push(lead.id);
    }
    if (lead.submittedAt) {
      timestamps.push(lead.submittedAt);
    }
  }
  store.remember({ ids, since: timestamps.sort().at(-1) });
}

async function pollNewLeads(source?: LeadSource): Promise<LeadFields[]> {
  const store = createCursorStore(inboundLeadConfig.cursorPath);
  const cursor = store.read();
  const collected: LeadFields[] = [];

  if ((!source || source === "typeform") && isTypeformConfigured()) {
    const typeform = createTypeformClient(inboundLeadConfig);
    if (typeform.ok) {
      const responses = await typeform.value.listResponsesSince({
        since: cursor.since,
        seenIds: cursor.seenIds,
      });
      collected.push(...responses);
    }
  }

  if ((!source || source === "crm") && isCrmConfigured()) {
    const client = createConfiguredCrmClient();
    if (client.ok) {
      const records = await client.value.listNewSince({
        since: cursor.since,
        seenIds: cursor.seenIds,
      });
      collected.push(...records);
    }
  }

  return collected.filter((lead) => isNewSinceCursor(cursor, lead));
}
