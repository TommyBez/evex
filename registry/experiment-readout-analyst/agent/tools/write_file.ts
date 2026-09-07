import { defineTool } from "eve/tools";
import { writeFile } from "eve/tools/write_file";

/**
 * Keep the built-in sandbox write_file so the agent can optionally save a
 * readout to a local file. Writing a file is not shipping a change.
 */
export default defineTool({
  ...writeFile,
  description:
    "Optionally write the drafted experiment readout to a local sandbox file for the operator to copy. Does not ship code, deploy a variant, or open GitHub pull requests.",
});
