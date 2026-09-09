import { defineTool } from "eve/tools";
import { z } from "zod";

import { enrichLead } from "../lib/enrich";
import { inboundLeadConfig } from "../lib/lead-config";

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

export default defineTool({
  description:
    "Normalize an inbound lead from untrusted form fields. Fail-closed when the email is missing, invalid, or a free domain while work email is required. Never invent firmographics. Never writes the CRM and never emails the lead.",
  inputSchema: z.object({
    lead: leadFieldsSchema,
  }),
  execute({ lead }) {
    const result = enrichLead(lead, inboundLeadConfig);
    if (!result.enriched) {
      return {
        enriched: false,
        failClosed: true,
        written: false,
        emailedLead: false,
        looksLikeInstructions: result.looksLikeInstructions,
        note: result.note,
      };
    }
    return {
      enriched: true,
      failClosed: false,
      written: false,
      emailedLead: false,
      looksLikeInstructions: result.value.looksLikeInstructions,
      email: result.value.email,
      domain: result.value.domain,
      company: result.value.company,
      workEmail: result.value.workEmail,
      lead: result.value.lead,
    };
  },
});
