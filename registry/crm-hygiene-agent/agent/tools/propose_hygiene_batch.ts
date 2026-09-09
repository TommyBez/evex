import { defineTool } from "eve/tools";
import { z } from "zod";

import { createAuditLog } from "../lib/audit-log";
import { crmHygieneConfig } from "../lib/crm-config";
import { proposeHygieneBatch, type CrmRecord } from "../lib/hygiene";

const recordSchema = z.object({
  id: z.string().min(1).max(200),
  email: z.string().max(300).optional(),
  firstName: z.string().max(200).optional(),
  lastName: z.string().max(200).optional(),
  phone: z.string().max(80).optional(),
  company: z.string().max(200).optional(),
  website: z.string().max(400).optional(),
});

export default defineTool({
  description:
    "Draft a reviewable dedupe, normalize, and enrich batch from scanned CRM records. Appends a proposed event to the audit log. Never writes to the CRM.",
  inputSchema: z.object({
    provider: z.string().min(1).max(40),
    records: z.array(recordSchema).max(500),
    scannedAt: z.string().min(1).optional(),
  }),
  execute({ provider, records, scannedAt }) {
    const batch = proposeHygieneBatch({
      provider,
      records: records as CrmRecord[],
      scannedAt,
      defaultPhoneCountryCode: crmHygieneConfig.defaultPhoneCountryCode,
    });
    const audit = createAuditLog(crmHygieneConfig.auditPath);
    audit.purgeExpired({
      retentionDays: crmHygieneConfig.auditRetentionDays,
    });
    audit.saveBatch(batch);
    audit.append({
      type: "proposed",
      batchId: batch.batchId,
      proposalIds: batch.proposals.map((proposal) => proposal.id),
      written: false,
    });
    return {
      ...batch,
      written: false,
      note: "Batch is proposed only. Call preview_hygiene_digest next. apply_hygiene_writes is the only CRM write path.",
    };
  },
});
