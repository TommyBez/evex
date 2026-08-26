import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  docsSearchRoots,
  docsSearchRootsFromListing,
  isAllowedDocsPath,
  normalizeDocsPath,
} from "../lib/docs-paths";

const searchDocsInput = z.object({
  query: z
    .string()
    .min(1)
    .max(200)
    .describe(
      "Literal or simple keyword query to search inside documentation files.",
    ),
  pathHint: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe(
      "Optional docs path or directory to narrow the search (README.md, docs/, CONTRIBUTING*, AGENTS.md).",
    ),
});

type SearchHit = {
  line: number;
  path: string;
  text: string;
};

export default defineTool({
  description:
    "Search documentation files (README, docs/, CONTRIBUTING*, AGENTS.md) for a query. Prefer this before answering. Does not search application source.",
  inputSchema: searchDocsInput,
  async execute(input, ctx) {
    const sandbox = await ctx.getSandbox();
    let roots: string[];
    if (input.pathHint) {
      roots = [normalizeDocsPath(input.pathHint)];
    } else {
      const listing = await sandbox.run({
        command: "ls -1A 2>/dev/null | head -n 200",
      });
      const entries = (listing.stdout ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      roots = docsSearchRootsFromListing(entries);
      if (roots.length === 0) {
        roots = [...docsSearchRoots()];
      }
    }

    for (const root of roots) {
      if (root !== "docs" && !isAllowedDocsPath(root)) {
        return {
          hits: [] as SearchHit[],
          note: `Refused non-docs path: ${root}`,
          query: input.query,
        };
      }
    }

    const escaped = input.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pathArgs = roots.map((root) => shellQuote(root)).join(" ");
    // Prefer rg when present. Do not pipe rg into head before checking
    // availability: without rg, `rg | head` still exits 0 via head and would
    // skip the grep fallback.
    const command = [
      "set +e",
      `if command -v rg >/dev/null 2>&1; then rg -n -S --no-heading -e ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; else grep -RIn -E ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; fi`,
      "exit 0",
    ].join("; ");

    const result = await sandbox.run({ command });
    const stdout = result.stdout ?? "";

    const hits: SearchHit[] = [];
    for (const line of stdout.split("\n")) {
      if (!line.trim()) {
        continue;
      }
      const match = /^([^:]+):(\d+):(.*)$/.exec(line);
      if (!match) {
        continue;
      }
      const path = normalizeDocsPath(match[1] ?? "");
      if (!isAllowedDocsPath(path)) {
        continue;
      }
      hits.push({
        path,
        line: Number(match[2]),
        text: (match[3] ?? "").slice(0, 240),
      });
    }

    return {
      hits,
      note:
        hits.length === 0
          ? "No documentation matches. Say so if the docs do not answer the question."
          : `Found ${hits.length} documentation hit(s).`,
      query: input.query,
    };
  },
});

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
