import { connect } from "@vercel/connect/eve";
import { defineMcpClientConnection } from "eve/connections";

import {
  LINEAR_READ_TOOLS,
  linearConnectorUidFromEnv,
  needsLinearWriteApproval,
} from "../lib/linear-connection";

/**
 * Read-only Linear lookup for team and people names while drafting.
 * Write tools are not in the allow list. Unexpected tools fail closed to
 * approval so this agent never auto-creates issues.
 */
export default defineMcpClientConnection({
  url: "https://mcp.linear.app/mcp",
  description:
    "Linear workspace reads for team and issue context while drafting follow-ups. Does not create issues.",
  auth: connect(linearConnectorUidFromEnv(process.env.LINEAR_CONNECT_UID)),
  tools: {
    allow: [...LINEAR_READ_TOOLS],
  },
  approval: ({ toolName }) => needsLinearWriteApproval(toolName),
});
