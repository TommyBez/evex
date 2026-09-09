import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createAuditLog, proposalIdsOf } from "../lib/audit-log";
import { crmHygieneConfig } from "../lib/crm-config";
import type { HygieneBatch } from "../lib/hygiene";
import {
  batchProviderMismatch,
  createConfiguredCrmClient,
} from "../lib/providers/index";
import { createApprovalGrant } from "../lib/write-guard";

const proposalSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["dedupe", "normalize", "enrich"]),
  recordId: z.string().min(1),
  mergeRecordId: z.string().min(1).optional(),
  before: z.record(z.string(), z.unknown()),
  after: z.record(z.string(), z.unknown()),
  reason: z.string().min(1),
});

const applyHygieneWritesInput = z.object({
  batch: z.object({
    batchId: z.string().min(1),
    provider: z.string().min(1),
    scannedAt: z.string().min(1),
    recordCount: z.number().int().min(0),
    proposals: z.array(proposalSchema).min(1),
  }),
  confirmWrite: z
    .boolean()
    .describe(
      "Must be true after Eve human approval. There is no auto-merge or silent overwrite.",
    ),
});

export default defineTool({
  description:
    "Apply a previously proposed CRM hygiene batch to HubSpot, Salesforce, or Pipedrive. Always pauses for Eve human approval. Requires confirmWrite=true. This is the only CRM write path. No auto-merge and no silent overwrite.",
  inputSchema: applyHygieneWritesInput,
  approval: always<z.infer<typeof applyHygieneWritesInput>>(),
  async execute({ batch, confirmWrite }) {
    const audit = createAuditLog(crmHygieneConfig.auditPath);
    const typedBatch = batch as HygieneBatch;
    const proposalIds = proposalIdsOf(typedBatch);

    if (!confirmWrite) {
      audit.append({
        type: "refused",
        batchId: typedBatch.batchId,
        proposalIds,
        written: false,
        note: "confirmWrite was false. No CRM write ran.",
      });
      return {
        written: false,
        notConfirmed: true,
        note: "confirmWrite must be true after Eve human approval. No CRM write ran.",
      };
    }

    let grant;
    try {
      grant = createApprovalGrant({
        batchId: typedBatch.batchId,
        confirmWrite,
      });
    } catch (error) {
      audit.append({
        type: "refused",
        batchId: typedBatch.batchId,
        proposalIds,
        written: false,
        note: error instanceof Error ? error.message : "Write grant refused.",
      });
      return {
        written: false,
        notConfirmed: true,
        note: error instanceof Error ? error.message : "Write grant refused.",
      };
    }

    const client = createConfiguredCrmClient();
    if (!client.ok) {
      audit.append({
        type: "refused",
        batchId: typedBatch.batchId,
        proposalIds,
        written: false,
        note: client.note,
      });
      return {
        written: false,
        note: client.note,
        missingEnv: client.missingEnv,
      };
    }

    const mismatch = batchProviderMismatch(
      typedBatch.provider,
      client.value.provider,
    );
    if (mismatch) {
      audit.append({
        type: "refused",
        batchId: typedBatch.batchId,
        proposalIds,
        written: false,
        note: mismatch,
      });
      return {
        written: false,
        note: mismatch,
      };
    }

    audit.append({
      type: "approved",
      batchId: typedBatch.batchId,
      proposalIds,
      written: false,
      note: `Grant issued at ${grant.issuedAt} from ${grant.source}.`,
    });

    try {
      const result = await client.value.applyWrites({
        batchId: typedBatch.batchId,
        proposals: typedBatch.proposals,
        grant,
      });

      audit.append({
        type: "written",
        batchId: typedBatch.batchId,
        proposalIds: result.applied,
        written: true,
      });

      return {
        written: true,
        applied: result.applied,
        batchId: typedBatch.batchId,
        provider: client.value.provider,
      };
    } catch (error) {
      const note =
        error instanceof Error ? error.message : "CRM write failed.";
      audit.append({
        type: "refused",
        batchId: typedBatch.batchId,
        proposalIds,
        written: false,
        note,
      });
      return {
        written: false,
        applied: [],
        note,
      };
    }
  },
});
