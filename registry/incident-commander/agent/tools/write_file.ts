import { defineTool } from "eve/tools";
import { writeFile } from "eve/tools/write_file";

/**
 * Keep the built-in sandbox write_file so the agent can optionally save a
 * readout to a local file. Writing a file is not paging or notifying.
 */
export default defineTool({
  ...writeFile,
  description:
    "Optionally write the drafted incident readout to a local sandbox file for the operator to copy. Does not page, notify, send, or open GitHub issues.",
});
