import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import {
  BROKERED_VERCEL_TOKEN_PLACEHOLDER,
  inAppRoot,
  runBrokeredVercelCommand,
  shellQuote,
  toCliModelOutput,
} from "../lib/vercel-brokered-cli";

const vercelAction = z.enum([
  "whoami",
  "connect_create_slack",
  "connect_detach",
  "connect_attach_slack",
  "deploy_preview",
  "deploy_production",
  "link_project",
]);

const inputSchema = z.object({
  action: vercelAction,
  appRoot: z
    .string()
    .min(1)
    .default(".")
    .describe("Workspace-relative Eve app root."),
  connectUid: z
    .string()
    .min(1)
    .optional()
    .describe("Vercel Connect client UID, for example slack/my-agent."),
  projectName: z.string().min(1).optional(),
  reason: z
    .string()
    .min(1)
    .max(1000)
    .describe("What the approved Vercel operation will change."),
  triggerPath: z.string().min(1).default("/eve/v1/slack"),
});

export default defineTool({
  description:
    "Run approved Vercel CLI operations with Vercel authentication brokered through the sandbox network policy. Use it for Vercel Connect setup, project linking, preview deploys, and production deploys. Project linking runs vercel link, which can retrieve VERCEL_OIDC_TOKEN for local model calls.",
  inputSchema,
  approval: always<z.infer<typeof inputSchema>>(),
  async execute(input, ctx) {
    const command = buildVercelCommand(input);
    return await runBrokeredVercelCommand(ctx, inAppRoot(input.appRoot, command));
  },
  toModelOutput: toCliModelOutput,
});

function buildVercelCommand(input: z.infer<typeof inputSchema>): string {
  switch (input.action) {
    case "whoami":
      return withVercelFlags("npx vercel whoami");
    case "connect_create_slack":
      return withVercelFlags("npx vercel connect create slack --triggers");
    case "connect_detach":
      return withVercelFlags(
        `npx vercel connect detach ${requiredConnectUid(input)} --yes`,
      );
    case "connect_attach_slack":
      return withVercelFlags(
        [
          "npx vercel connect attach",
          requiredConnectUid(input),
          "--triggers",
          "--trigger-path",
          shellQuote(input.triggerPath),
          "--yes",
        ].join(" "),
      );
    case "deploy_preview":
      return withVercelFlags("npx vercel deploy --yes");
    case "deploy_production":
      return withVercelFlags("npx vercel deploy --prod --yes");
    case "link_project":
      return withVercelFlags(buildLinkCommand(input));
  }
}

function buildLinkCommand(input: z.infer<typeof inputSchema>): string {
  if (!input.projectName) {
    throw new Error(
      "projectName is required when action is link_project.",
    );
  }

  return `npx vercel link --project ${shellQuote(input.projectName)} --yes --non-interactive`;
}

function requiredConnectUid(input: z.infer<typeof inputSchema>): string {
  if (!input.connectUid) {
    throw new Error(
      "connectUid is required for connect_detach and connect_attach_slack.",
    );
  }

  return shellQuote(input.connectUid);
}

function withVercelFlags(command: string): string {
  return `FF_CONNECT_ENABLED=1 VERCEL_USE_EXPERIMENTAL_FRAMEWORKS=1 ${command} --token ${shellQuote(
    BROKERED_VERCEL_TOKEN_PLACEHOLDER,
  )}`;
}
