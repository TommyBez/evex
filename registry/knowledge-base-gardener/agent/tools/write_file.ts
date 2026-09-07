import { defineTool } from "eve/tools";
import { writeFile } from "eve/tools/write_file";

import { evaluateDraftWritePath } from "../lib/draft-write-paths";
import { configuredProductDocsRoots } from "../lib/product-docs-paths";

/**
 * Keep the built-in sandbox write_file so the agent can optionally save a
 * draft update to a local file under /workspace/drafts/. Writing a file is
 * not publishing and must never be described as shipping the docs. Paths
 * under PRODUCT_DOCS_ROOTS and other protected locations are refused.
 */
export default defineTool({
  ...writeFile,
  description:
    "Optionally write the drafted documentation update to a local file under /workspace/drafts/ for the operator to copy. Refuses product documentation (PRODUCT_DOCS_ROOTS such as docs, help, support) and other protected paths. Does not publish docs, open GitHub pull requests, or send the update.",
  async execute(input, ctx) {
    const decision = evaluateDraftWritePath(
      input.filePath,
      configuredProductDocsRoots(),
    );
    if (!decision.ok) {
      throw new Error(decision.note);
    }

    return await writeFile.execute(
      {
        ...input,
        filePath: decision.absolutePath,
      },
      ctx,
    );
  },
});
