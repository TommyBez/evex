import { defineTool } from "eve/tools";
import { z } from "zod";

import { enrichLead } from "../lib/enrich";
import { inboundLeadConfig } from "../lib/lead-config";
import { scoreIcp } from "../lib/score";

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
    "Score an enriched inbound lead against the configured ICP. Returns hot, warm, cold, or unscored. Unscored and fail-closed leads are never hot. Never writes the CRM and never emails the lead.",
  inputSchema: z.object({
    lead: leadFieldsSchema,
  }),
  execute({ lead }) {
    const enriched = enrichLead(lead, inboundLeadConfig);
    if (!enriched.enriched) {
      return {
        score: 0,
        band: "unscored",
        hot: false,
        written: false,
        emailedLead: false,
        failClosed: true,
        reasons: [enriched.note],
      };
    }
    const scored = scoreIcp(enriched.value, inboundLeadConfig);
    return {
      ...scored,
      written: false,
      emailedLead: false,
      failClosed: false,
      email: enriched.value.email,
      company: enriched.value.company,
    };
  },
});
