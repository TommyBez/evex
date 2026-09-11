import { defineTool } from "eve/tools";
import { z } from "zod";

import { accountIdsOf, createAuditLog } from "../lib/audit-log";
import { churnRenewalConfig } from "../lib/renewal-config";
import { scoreRenewalRisk } from "../lib/score";

const accountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ownerName: z.string().optional(),
  ownerEmail: z.string().optional(),
  renewalDate: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  domain: z.string().optional(),
});

const healthLookupSchema = z.union([
  z.object({
    ok: z.literal(true),
    failClosed: z.literal(false),
    health: z.object({
      customerId: z.string().min(1),
      status: z.string().optional(),
      delinquent: z.boolean().optional(),
      pastDue: z.boolean().optional(),
      unpaidInvoices: z.number().optional(),
      failedCharges30d: z.number().optional(),
      openInvoiceCents: z.number().optional(),
      subscriptionStatus: z.string().optional(),
    }),
  }),
  z.object({
    ok: z.literal(false),
    failClosed: z.literal(true),
    note: z.string().min(1),
  }),
]);

export default defineTool({
  description:
    "Score renewal-window accounts into Healthy, Watch, or At-risk using Stripe health. Fail-closed health stays unscored. Writes an append-only audit snapshot. Does not write the CRM and does not email the customer.",
  inputSchema: z.object({
    provider: z.string().min(1),
    accounts: z.array(accountSchema),
    healthByAccountId: z.record(z.string(), healthLookupSchema),
  }),
  execute({ provider, accounts, healthByAccountId }) {
    const audit = createAuditLog(churnRenewalConfig.auditPath);
    audit.purgeExpired({
      retentionDays: churnRenewalConfig.auditRetentionDays,
    });
    const batch = scoreRenewalRisk({
      provider,
      accounts,
      healthByAccountId,
      previousBuckets: audit.previousBuckets(),
    });
    audit.saveBatch(batch);
    audit.append({
      type: "scored",
      batchId: batch.batchId,
      accountIds: accountIdsOf(batch),
      written: false,
      emailedCustomer: false,
      note: `${batch.movers.length} movers, ${batch.skipped.length} fail-closed.`,
    });
    return {
      ...batch,
      written: false,
      emailedCustomer: false,
    };
  },
});
