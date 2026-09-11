import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  createCursorStore,
  isNewSinceCursor,
  nextCursorSince,
} from "../lib/cursor-store";
import {
  inboundLeadConfig,
  isCrmConfigured,
  isTypeformConfigured,
  type InboundLeadConfig,
} from "../lib/lead-config";
import { parseLeadEvent, type LeadSource } from "../lib/lead-events";
import { createConfiguredCrmClient } from "../lib/providers/index";
import { createTypeformClient } from "../lib/providers/typeform";
import { loadPushLead } from "../lib/push-inbox";
import type { LeadFields } from "../lib/untrusted";

const ingestLeadEventInput = z.object({
  source: z.enum(["form", "typeform", "crm", "generic"]).optional(),
  payload: z.unknown().optional(),
  leadId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe(
      "Correlation id from POST /leads/push. Loads the persisted sanitized lead when payload is omitted.",
    ),
  poll: z
    .boolean()
    .optional()
    .describe(
      "When true, or when payload and leadId are omitted on a cron run with Typeform or CRM configured, poll new-since-cursor records.",
    ),
});

export function shouldPollLeadIngest(input: {
  readonly hasInbound: boolean;
  readonly poll?: boolean;
  readonly pollCapable: boolean;
}): boolean {
  if (input.poll === true) {
    return true;
  }
  if (input.hasInbound || input.poll === false) {
    return false;
  }
  return input.pollCapable;
}

export async function runIngestLeadEvent(
  input: {
    readonly source?: LeadSource;
    readonly payload?: unknown;
    readonly leadId?: string;
    readonly poll?: boolean;
  },
  config: InboundLeadConfig = inboundLeadConfig,
): Promise<Record<string, unknown>> {
  const storedLead = input.leadId ? loadPushLead(input.leadId) : undefined;
  if (input.leadId && !storedLead && input.payload === undefined) {
    return {
      ingested: false,
      written: false,
      emailedLead: false,
      note: "unknown_lead_id",
      leadId: input.leadId,
    };
  }

  const inbound =
    input.payload !== undefined
      ? parseLeadEvent({
          body: input.payload,
          sourceHint: input.source,
        })
      : storedLead
        ? {
            source: (input.source ?? storedLead.source ?? "form") as LeadSource,
            reason: "push" as const,
            lead: storedLead,
          }
        : undefined;

  if (inbound && !("ignored" in inbound)) {
    rememberLeads([inbound.lead], config);
    return {
      ingested: true,
      written: false,
      emailedLead: false,
      reason: inbound.reason,
      source: inbound.source,
      leadId: input.leadId,
      leads: [inbound.lead],
    };
  }

  if (inbound && "ignored" in inbound) {
    return {
      ingested: false,
      written: false,
      emailedLead: false,
      note: "Payload was not an inbound lead event.",
    };
  }

  const shouldPoll = shouldPollLeadIngest({
    hasInbound: false,
    poll: input.poll,
    pollCapable: isTypeformConfigured(config) || isCrmConfigured(config),
  });

  if (!shouldPoll) {
    return {
      ingested: false,
      written: false,
      emailedLead: false,
      note: "No payload and poll was not requested.",
    };
  }

  const leads = await pollNewLeads(input.source, config);
  rememberLeads(leads, config);
  return {
    ingested: leads.length > 0,
    written: false,
    emailedLead: false,
    reason: "poll",
    source: input.source ?? (isTypeformConfigured(config) ? "typeform" : "crm"),
    leads,
  };
}

export default defineTool({
  description:
    "Ingest a signed form or CRM webhook payload, a persisted push leadId, or poll Typeform Connect and the CRM for leads newer than the cursor. Returns sanitized lead fields only. Never writes the CRM and never emails the lead.",
  inputSchema: ingestLeadEventInput,
  async execute({ source, payload, leadId, poll }) {
    return runIngestLeadEvent({ source, payload, leadId, poll });
  },
});

function rememberLeads(
  leads: LeadFields[],
  config: InboundLeadConfig,
): void {
  const store = createCursorStore(config.cursorPath);
  const ids: string[] = [];
  for (const lead of leads) {
    if (lead.id) {
      ids.push(lead.id);
    }
  }
  store.remember({ ids, since: nextCursorSince(leads) });
}

async function pollNewLeads(
  source: LeadSource | undefined,
  config: InboundLeadConfig,
): Promise<LeadFields[]> {
  const store = createCursorStore(config.cursorPath);
  const cursor = store.read();
  const collected: LeadFields[] = [];

  if ((!source || source === "typeform") && isTypeformConfigured(config)) {
    const typeform = createTypeformClient(config);
    if (typeform.ok) {
      const responses = await typeform.value.listResponsesSince({
        since: cursor.since,
        seenIds: cursor.seenIds,
      });
      collected.push(...responses);
    }
  }

  if ((!source || source === "crm") && isCrmConfigured(config)) {
    const client = createConfiguredCrmClient(config);
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
