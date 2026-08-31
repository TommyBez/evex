import { defineTool } from "eve/tools";
import { writeFile } from "eve/tools/write_file";

/**
 * Keep the built-in sandbox write_file so the agent can optionally save a
 * draft reply to a local file. Writing a file is not sending mail and must
 * never be described as delivery.
 */
export default defineTool({
  ...writeFile,
  description:
    "Optionally write the drafted support reply to a local sandbox file for the operator to copy. Does not send email, post to a ticket API, or open GitHub issues.",
});
