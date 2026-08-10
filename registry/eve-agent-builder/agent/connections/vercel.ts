import { defineMcpClientConnection } from "eve/connections";

const VERCEL_MCP_URL = process.env.VERCEL_MCP_URL ?? "https://mcp.vercel.com";

const VERCEL_MCP_READ_TOOLS = [
  "get_agent_run",
  "get_agent_run_trace",
  "get_deployment",
  "get_deployment_build_logs",
  "get_project",
  "get_runtime_errors",
  "get_runtime_logs",
  "list_agent_run_projects",
  "list_agent_runs",
  "list_deployments",
  "list_projects",
  "list_teams",
  "search_vercel_documentation",
  "web_fetch_vercel_url",
] as const;

const VERCEL_MCP_APPROVED_TOOLS = [
  "get_access_to_vercel_url",
] as const;

export default defineMcpClientConnection({
  url: VERCEL_MCP_URL,
  description:
    "Vercel MCP for project/deployment inspection, logs, runtime errors, Agent Runs, Vercel docs, and protected preview fetching. Use connection_search to discover these Vercel tools before calling them. Do not use this connection for local vercel link or Vercel Connect setup.",
  auth: {
    principalType: "app",
    getToken: async () => {
      const token = process.env.VERCEL_TOKEN;

      if (!token) {
        throw new Error(
          "VERCEL_TOKEN is required in the app runtime for the Vercel MCP connection.",
        );
      }

      return { token };
    },
  },
  tools: {
    allow: [...VERCEL_MCP_READ_TOOLS, ...VERCEL_MCP_APPROVED_TOOLS],
  },
  approval: ({ toolName }) => {
    const normalizedToolName = toolName.split("__").at(-1) ?? toolName;

    if (
      VERCEL_MCP_APPROVED_TOOLS.includes(
        normalizedToolName as (typeof VERCEL_MCP_APPROVED_TOOLS)[number],
      )
    ) {
      return "user-approval";
    }

    return "not-applicable";
  },
});
