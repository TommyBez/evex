import { Resend } from "resend";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Preview or send a lifecycle email through Resend.",
  inputSchema: z.object({
    from: z.string().email(),
    to: z.array(z.string().email()).min(1).max(50),
    subject: z.string().min(1),
    html: z.string().min(1),
    dryRun: z.boolean().default(true),
  }),
  async execute({ from, to, subject, html, dryRun }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "RESEND_API_KEY", recipients: to.length };
    }

    if (dryRun) {
      return { dryRun: true, from, to, subject, htmlPreview: html.slice(0, 500) };
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({ from, to, subject, html });
    return { result };
  },
});
