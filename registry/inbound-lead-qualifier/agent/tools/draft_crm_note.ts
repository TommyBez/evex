import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { enrichLead } from "../lib/enrich";
import { inboundLeadConfig, isCrmConfigured } from "../lib/lead-config";
import { draftCrmNoteBody } from "../lib/note-copy";
import { createConfiguredCrmClient } from "../lib/providers/index";
import { scoreIcp } from "../lib/score";
import { createApprovalGrant } from "../lib/write-guard";

const leadFieldsSchema = z.object({
  id: z.string().max(120).optional(),
  email: z.string().max(254).optional(),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  company: z.string().max(160).optional(),
  title: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  message: z.string().max(1000).optional(),
  source: z.string().max(40).optional(),
  submittedAt: z.string().max(40).optional(),
});

const draftCrmNoteInput = z.object({
  lead: leadFieldsSchema,
  confirmWrite: z
    .boolean()
    .describe(
      "Must be true after Eve human approval. The tool returns written false until then.",
    ),
});

export default defineTool({
  description:
    "Draft a CRM contact note for an inbound lead. Always pauses for Eve human approval. Returns written false until confirmWrite is true after that approval. This is the only CRM write path. Never emails the lead.",
  inputSchema: draftCrmNoteInput,
  approval: always<z.infer<typeof draftCrmNoteInput>>(),
  async execute({ lead, confirmWrite }) {
    const enriched = enrichLead(lead, inboundLeadConfig);
    if (!enriched.enriched) {
      return {
        written: false,
        emailedLead: false,
        failClosed: true,
        note: enriched.note,
      };
    }

    const scored = scoreIcp(enriched.value, inboundLeadConfig);
    const body = draftCrmNoteBody({ lead: enriched.value, score: scored });
    const leadId =
      enriched.value.lead.id ??
      enriched.value.email ??
      `lead-${enriched.value.domain}`;

    if (!confirmWrite) {
      return {
        written: false,
        emailedLead: false,
        notConfirmed: true,
        leadId,
        body,
        band: scored.band,
        note: "confirmWrite must be true after Eve human approval. No CRM write ran.",
      };
    }

    if (!isCrmConfigured()) {
      return {
        written: false,
        emailedLead: false,
        notConfigured: true,
        leadId,
        body,
        note: "CRM Connect is not configured. The note stayed a draft.",
      };
    }

    let grant;
    try {
      grant = createApprovalGrant({ leadId, confirmWrite });
    } catch (error) {
      return {
        written: false,
        emailedLead: false,
        notConfirmed: true,
        note: error instanceof Error ? error.message : "Write grant refused.",
      };
    }

    const client = createConfiguredCrmClient();
    if (!client.ok) {
      return {
        written: false,
        emailedLead: false,
        note: client.note,
        missingEnv: client.missingEnv,
      };
    }

    const result = await client.value.upsertContactAndNote({
      draft: {
        leadId,
        email: enriched.value.email,
        firstName: enriched.value.lead.firstName,
        lastName: enriched.value.lead.lastName,
        company: enriched.value.company,
        title: enriched.value.lead.title,
        phone: enriched.value.lead.phone,
        body,
      },
      grant,
    });

    return {
      written: result.written,
      emailedLead: false,
      contactId: result.contactId,
      noteId: result.noteId,
      provider: client.value.provider,
      leadId,
    };
  },
});
