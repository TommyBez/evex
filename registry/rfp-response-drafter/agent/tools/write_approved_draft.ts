import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import {
  collectOpenQuestions,
  evaluateCiteGate,
  evaluateSmeWriteGate,
  type DraftSection,
  type PackSource,
} from "../lib/cite-gate";
import { draftMailboxSubject, formatDraftBody } from "../lib/draft-copy";
import { createConfiguredDrive } from "../lib/providers/drive";
import { createConfiguredMailbox } from "../lib/providers/mailbox";
import { rfpResponseConfig, siblingStorePath } from "../lib/rfp-config";
import { createSmeStore } from "../lib/sme-store";
import { executeApprovedWrite } from "../lib/write-back";
import { assertDraftWriteIntent } from "../lib/write-guard";

const citationSchema = z.object({
  sourceId: z.string().min(1).max(500),
  locator: z.string().max(200).optional(),
});

const sectionSchema = z.object({
  heading: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  claims: z
    .array(
      z.object({
        text: z.string().min(1).max(2000),
        citation: citationSchema,
      }),
    )
    .min(1)
    .max(20),
  openQuestions: z.array(z.string().min(1).max(500)).max(10).optional(),
});

const sourceSchema = z.object({
  sourceId: z.string().min(1).max(500),
  title: z.string().min(1).max(400),
  kind: z.enum(["rfp", "pack"]),
  origin: z.enum(["drive", "sandbox"]),
  path: z.string().max(400).optional(),
  workspacePath: z.string().max(400).optional(),
  driveFileId: z.string().max(200).optional(),
  driveUrl: z.string().max(500).optional(),
});

const writeApprovedDraftInput = z.object({
  rfpTitle: z.string().min(1).max(200),
  rfpId: z.string().min(1).max(200),
  sources: z.array(sourceSchema).min(1).max(40),
  sections: z.array(sectionSchema).min(1).max(30),
  openQuestions: z.array(z.string().min(1).max(500)).max(10).optional(),
  confirmWrite: z
    .boolean()
    .describe("Must be true after Eve and SME approval. Never a portal submit."),
  intent: z
    .string()
    .max(40)
    .optional()
    .describe("Must be draft. submit, portal, paste, send, and smtp are refused."),
  target: z.enum(["drive", "mailbox", "both"]).optional(),
});

export default defineTool({
  description:
    "Write an approved RFP draft as a Google Drive Doc and/or a mailbox Drafts message. Always pauses for Eve human approval. Requires confirmWrite=true and SME approval when questions are open. Never submits a portal, never pastes text as write-back, never sends mail.",
  inputSchema: writeApprovedDraftInput,
  approval: always<z.infer<typeof writeApprovedDraftInput>>(),
  async execute(input) {
    try {
      assertDraftWriteIntent(input.intent);
    } catch (error) {
      return {
        drafted: false,
        sent: false,
        submitted: false,
        note: error instanceof Error ? error.message : "Write intent refused.",
      };
    }

    if (!input.confirmWrite) {
      return {
        drafted: false,
        sent: false,
        submitted: false,
        notConfirmed: true,
        note: "confirmWrite must be true after SME approval. This tool never submits a portal.",
      };
    }

    const openQuestions = collectOpenQuestions(
      input.sections as DraftSection[],
      input.openQuestions ?? [],
    );
    const smeRecord = createSmeStore(
      siblingStorePath(rfpResponseConfig.storePath, "rfp-sme-store.json"),
    ).findApproved(input.rfpId);
    const smeGate = evaluateSmeWriteGate({
      openQuestions,
      approvedRecord: smeRecord,
    });
    if (!smeGate.ok) {
      return {
        drafted: false,
        sent: false,
        submitted: false,
        smeBlocked: true,
        note: smeGate.note,
        openQuestions: smeGate.openQuestions,
      };
    }

    const gate = evaluateCiteGate({
      sections: input.sections as DraftSection[],
      sources: input.sources as PackSource[],
    });
    if (!gate.ok) {
      return {
        drafted: false,
        sent: false,
        submitted: false,
        note: gate.note,
        uncited: gate.uncited,
      };
    }

    const target = input.target ?? rfpResponseConfig.writeback ?? "drive";
    const body = formatDraftBody({
      rfpTitle: input.rfpTitle,
      sections: gate.sections,
    });
    const title = `DRAFT: ${input.rfpTitle}`;

    const written = await executeApprovedWrite({
      target,
      config: rfpResponseConfig,
      writeDrive: () => writeDriveDraft(title, body),
      writeMailbox: () =>
        writeMailboxDraft({
          rfpId: input.rfpId,
          subject: draftMailboxSubject(input.rfpTitle),
          body,
        }),
    });
    if (!written.drafted) {
      return written;
    }

    return {
      ...written,
      note:
        written.partial && written.note
          ? written.note
          : "Approved draft written. A human reviews the Drive Doc or mailbox Drafts. Nothing was submitted.",
    };
  },
});

async function writeDriveDraft(title: string, body: string) {
  const drive = createConfiguredDrive(rfpResponseConfig);
  if (!drive.ok) {
    return drive;
  }
  return {
    ok: true as const,
    value: await drive.value.createDraftDoc({ title, body }),
  };
}

async function writeMailboxDraft(input: {
  readonly rfpId: string;
  readonly subject: string;
  readonly body: string;
}) {
  const mailbox = createConfiguredMailbox();
  if (!mailbox.ok) {
    return mailbox;
  }
  const to = rfpResponseConfig.draftTo;
  if (!to) {
    return {
      ok: false as const,
      note: "Mailbox draft recipient is missing.",
      missingEnv: ["RFP_RESPONSE_DRAFT_TO"],
    };
  }
  return {
    ok: true as const,
    value: await mailbox.value.createDraft({
      to,
      subject: input.subject,
      body: input.body,
      rfpId: input.rfpId,
    }),
  };
}
