import { defineTool } from "eve/tools";
import { writeFile } from "eve/tools/write_file";

/**
 * Keep the built-in sandbox write_file so the agent can optionally save a
 * theme draft to a local file. Writing a file is not an Airtable write.
 */
export default defineTool({
  ...writeFile,
  description:
    "Optionally write the drafted feedback themes to a local sandbox file for the operator to copy. Does not write to Airtable or open GitHub issues.",
});
