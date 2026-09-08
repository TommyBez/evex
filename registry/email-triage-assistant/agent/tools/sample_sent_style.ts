import { defineTool } from "eve/tools";
import { z } from "zod";

import { emailTriageConfig } from "../lib/email-config";
import { createConfiguredMailbox } from "../lib/providers/index";
import { buildToneProfile } from "../lib/tone-profile";

export default defineTool({
  description:
    "Read recent Sent-folder messages and return a tone profile for draft replies. Read-only. Never sends mail.",
  inputSchema: z.object({
    max: z
      .number()
      .int()
      .positive()
      .max(20)
      .optional()
      .describe("How many sent messages to sample."),
  }),
  async execute({ max }) {
    const mailbox = createConfiguredMailbox();
    if (!mailbox.ok) {
      return {
        sampled: false,
        sent: false,
        note: mailbox.note,
        missingEnv: mailbox.missingEnv,
      };
    }

    const samples = await mailbox.value.sampleSent(
      max ?? emailTriageConfig.sentSampleSize,
    );
    return {
      sampled: true,
      sent: false,
      profile: buildToneProfile(samples),
    };
  },
});
