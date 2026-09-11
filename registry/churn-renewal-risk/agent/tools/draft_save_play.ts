import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createAuditLog } from "../lib/audit-log";
import { draftSavePlayBody } from "../lib/note-copy";
import { createConfiguredCrmClient } from "../lib/providers/index";
import { churnRenewalConfig } from "../lib/renewal-config";
import { refuseInstructionMarkedWrite } from "../lib/untrusted";
import { createApprovalGrant } from "../lib/write-guard";

const draftSavePlayInput = z.object({
  account: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    ownerName: z.string().optional(),
    ownerEmail: z.string().optional(),
    renewalDate: z.string().optional(),
    stripeCustomerId: z.string().optional(),
    domain: z.string().optional(),
  }),
  bucket: z.enum(["healthy", "watch", "at-risk"]),
  reasons: z.array(z.string()).default([]),
  play: z.string().max(500).optional(),
  confirmWrite: z
    .boolean()
    .describe(
      "Must be true after Eve human approval. The tool returns written false until then.",
    ),
});

export default defineTool({
  description:
    "Draft an owner save or expansion play as a CRM note on the HubSpot company or Salesforce account. Always pauses for Eve human approval. Returns written false until confirmWrite is true after that approval. This is the only CRM write path. Never emails the customer.",
  inputSchema: draftSavePlayInput,
  approval: always<z.infer<typeof draftSavePlayInput>>(),
  async execute({ account, bucket, reasons, play, confirmWrite }) {
    const audit = createAuditLog(churnRenewalConfig.auditPath);
    const body = draftSavePlayBody({
      scored: { account, bucket, reasons },
      play,
    });

    if (!confirmWrite) {
      audit.append({
        type: "refused",
        batchId: account.id,
        accountIds: [account.id],
        written: false,
        emailedCustomer: false,
        note: "confirmWrite was false. No CRM write ran.",
      });
      return {
        written: false,
        emailedCustomer: false,
        notConfirmed: true,
        accountId: account.id,
        body,
        note: "confirmWrite must be true after Eve human approval. No CRM write ran.",
      };
    }

    const refusedWrite = refuseInstructionMarkedWrite(account);
    if (refusedWrite) {
      audit.append({
        type: "refused",
        batchId: account.id,
        accountIds: [account.id],
        written: false,
        emailedCustomer: false,
        note: refusedWrite,
      });
      return {
        written: false,
        emailedCustomer: false,
        failClosed: true,
        accountId: account.id,
        note: refusedWrite,
      };
    }

    let grant;
    try {
      grant = createApprovalGrant({ accountId: account.id, confirmWrite });
    } catch (error) {
      audit.append({
        type: "refused",
        batchId: account.id,
        accountIds: [account.id],
        written: false,
        emailedCustomer: false,
        note: error instanceof Error ? error.message : "Write grant refused.",
      });
      return {
        written: false,
        emailedCustomer: false,
        notConfirmed: true,
        note: error instanceof Error ? error.message : "Write grant refused.",
      };
    }

    const client = createConfiguredCrmClient();
    if (!client.ok) {
      audit.append({
        type: "refused",
        batchId: account.id,
        accountIds: [account.id],
        written: false,
        emailedCustomer: false,
        note: client.note,
      });
      return {
        written: false,
        emailedCustomer: false,
        note: client.note,
        missingEnv: client.missingEnv,
      };
    }

    audit.append({
      type: "approved",
      batchId: account.id,
      accountIds: [account.id],
      written: false,
      emailedCustomer: false,
      note: `Grant issued at ${grant.issuedAt} from ${grant.source}.`,
    });

    const result = await client.value.writeAccountNote({
      draft: {
        accountId: account.id,
        name: account.name,
        ownerEmail: account.ownerEmail,
        body,
      },
      grant,
    });

    audit.append({
      type: "written",
      batchId: account.id,
      accountIds: [account.id],
      written: true,
      emailedCustomer: false,
    });

    return {
      written: result.written,
      emailedCustomer: false,
      accountId: result.accountId,
      noteId: result.noteId,
      provider: client.value.provider,
      body,
    };
  },
});
