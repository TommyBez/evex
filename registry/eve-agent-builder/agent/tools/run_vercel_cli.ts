import { defineTool } from "eve/tools";
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

const ACTIONS_REQUIRING_CONNECT_UID = new Set<VercelAction>([
  "connect_detach",
  "connect_attach_slack",
]);

// Per-action requirements are enforced in the schema so invalid calls are
// rejected before the approval prompt, not after a human already approved.
const inputSchema = z
  .object({
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
      .optional()
      .describe(
        "What the approved Vercel operation will change. Required for every action except whoami."
      ),
    triggerPath: z.string().min(1).default("/eve/v1/slack"),
  })
  .superRefine((input, ctx) => {
    if (input.action !== "whoami" && !input.reason) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: `reason is required when action is ${input.action}.`,
      });
    }

    if (ACTIONS_REQUIRING_CONNECT_UID.has(input.action) && !input.connectUid) {
      ctx.addIssue({
        code: "custom",
        path: ["connectUid"],
        message: `connectUid is required when action is ${input.action}.`,
      });
    }

    if (input.action === "link_project" && !input.projectName) {
      ctx.addIssue({
        code: "custom",
        path: ["projectName"],
        message: "projectName is required when action is link_project.",
      });
    }
  });

type VercelAction = z.infer<typeof vercelAction>;
type VercelCliInput = z.infer<typeof inputSchema>;

// vercel deploy --yes silently creates a new project when the workspace is
// not linked, which would ship to a target the user never confirmed.
const LINKED_PROJECT_GUARD =
  '[ -f .vercel/project.json ] || { echo "This workspace is not linked to a Vercel project. Run the link_project action first so the deploy target is explicit." >&2; exit 1; }';

export default defineTool({
  description:
    "Run Vercel CLI operations with Vercel authentication brokered through the sandbox network policy. whoami is a read-only auth check and does not require approval. Vercel Connect setup, project linking, preview deploys, and production deploys require approval. link_project runs vercel link and then vercel env pull .env.local, which writes VERCEL_OIDC_TOKEN for local model calls. Deploy actions require the workspace to already be linked to a Vercel project.",
  inputSchema,
  approval: ({ toolInput }) => approvalForVercelAction(toolInput),
  async execute(input, ctx) {
    const command = buildVercelCommand(input);
    return await runBrokeredVercelCommand(
      ctx,
      inAppRoot(input.appRoot, command)
    );
  },
  toModelOutput: toCliModelOutput,
});

function approvalForVercelAction(input: VercelCliInput | undefined) {
  if (input?.action === "whoami") {
    return "not-applicable";
  }

  return "user-approval";
}

function buildVercelCommand(input: VercelCliInput): string {
  switch (input.action) {
    case "whoami":
      return withVercelFlags("npx vercel whoami");
    case "connect_create_slack":
      return withVercelFlags("npx vercel connect create slack --triggers");
    case "connect_detach":
      return withVercelFlags(
        `npx vercel connect detach ${requiredConnectUid(input)} --yes`
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
        ].join(" ")
      );
    case "deploy_preview":
      return `${LINKED_PROJECT_GUARD} && ${withVercelFlags("npx vercel deploy --yes")}`;
    case "deploy_production":
      return `${LINKED_PROJECT_GUARD} && ${withVercelFlags("npx vercel deploy --prod --yes")}`;
    case "link_project":
      return [
        withVercelFlags(buildLinkCommand(input)),
        withVercelFlags("npx vercel env pull .env.local --yes"),
      ].join(" && ");
  }
}

function buildLinkCommand(input: VercelCliInput): string {
  if (!input.projectName) {
    throw new Error("projectName is required when action is link_project.");
  }

  return `npx vercel link --project ${shellQuote(input.projectName)} --yes --non-interactive`;
}

function requiredConnectUid(input: VercelCliInput): string {
  if (!input.connectUid) {
    throw new Error(
      "connectUid is required for connect_detach and connect_attach_slack."
    );
  }

  return shellQuote(input.connectUid);
}

function withVercelFlags(command: string): string {
  return `FF_CONNECT_ENABLED=1 VERCEL_USE_EXPERIMENTAL_FRAMEWORKS=1 ${command} --token ${shellQuote(
    BROKERED_VERCEL_TOKEN_PLACEHOLDER
  )}`;
}
