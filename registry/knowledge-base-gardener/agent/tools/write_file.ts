import { defineTool } from "eve/tools";
import { writeFile } from "eve/tools/write_file";

/**
 * Keep the built-in sandbox write_file so the agent can optionally save a
 * draft update to a local file. Writing a file is not publishing and must
 * never be described as shipping the docs.
 */
export default defineTool({
  ...writeFile,
  description:
    "Optionally write the drafted documentation update to a local sandbox file for the operator to copy. Does not publish docs, open GitHub pull requests, or send the update.",
});
