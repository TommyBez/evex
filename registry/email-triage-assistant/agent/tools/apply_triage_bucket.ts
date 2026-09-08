import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { emailTriageConfig } from "../lib/email-config";
import { createConfiguredMailbox } from "../lib/providers/index";
import { isKnownTriageBucket } from "../lib/triage-buckets";

const applyTriageBucketInput = z.object({
  threadId: z.string().min(1).max(400),
  bucket: z
    .string()
    .min(1)
    .max(80)
    .describe("One of the configured TRIAGE_BUCKETS slugs."),
  rationale: z.string().min(1).max(400),
});

export default defineTool({
  description:
    "Sort a thread into a configured triage bucket by applying a Gmail label, Outlook category, or IMAP Triage/ folder. Always pauses for Eve human approval on cron and webhook runs. Never sends mail.",
  inputSchema: applyTriageBucketInput,
  approval: always<z.infer<typeof applyTriageBucketInput>>(),
  async execute({ threadId, bucket, rationale }) {
    const normalized = bucket.trim().toLowerCase();
    if (!isKnownTriageBucket(normalized, emailTriageConfig.buckets)) {
      return {
        applied: false,
        sent: false,
        note: `Unknown bucket "${bucket}". Allowed: ${emailTriageConfig.buckets.join(", ")}.`,
      };
    }

    const mailbox = createConfiguredMailbox();
    if (!mailbox.ok) {
      return {
        applied: false,
        sent: false,
        note: mailbox.note,
        missingEnv: mailbox.missingEnv,
      };
    }

    const result = await mailbox.value.applyBucket(threadId, normalized);
    return {
      ...result,
      rationale,
    };
  },
});
