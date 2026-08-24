import { defineTool } from "eve/tools";
import { z } from "zod";

import { escapeHtml } from "../lib/html";
import { issueDigestConfig } from "../lib/issue-config";

const digestIssue = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  url: z.string().url(),
  labels: z.array(z.string()).default([]),
});

const digestSection = z.object({
  heading: z.string().min(1),
  issues: z.array(digestIssue),
});

export default defineTool({
  description:
    "Compose the weekly open-issue digest HTML. Escapes issue titles as text before inserting them. Prefer this over hand-written HTML so user-controlled titles cannot inject markup.",
  inputSchema: z.object({
    repo: z.string().min(1).optional(),
    sections: z.array(digestSection).min(1),
  }),
  execute({ repo, sections }) {
    const resolvedRepo = repo ?? issueDigestConfig.repo ?? "repository";
    const parts: string[] = [
      `<h1>Weekly open-issue digest: ${escapeHtml(resolvedRepo)}</h1>`,
    ];

    for (const section of sections) {
      parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
      if (section.issues.length === 0) {
        parts.push("<p>None.</p>");
        continue;
      }

      parts.push("<ul>");
      for (const issue of section.issues) {
        const labels =
          issue.labels.length > 0
            ? ` <small>(${escapeHtml(issue.labels.join(", "))})</small>`
            : "";
        parts.push(
          `<li><a href="${escapeHtml(issue.url)}">#${issue.number}</a> ${escapeHtml(issue.title)}${labels}</li>`,
        );
      }
      parts.push("</ul>");
    }

    return { html: parts.join("\n") };
  },
});
