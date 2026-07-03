import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  inAppRoot,
  runSandboxCommand,
  shellQuote,
  toCliModelOutput,
} from "../lib/vercel-brokered-cli";

const eveAction = z.enum(["info", "build", "eval", "channels_add"]);
const channelKind = z.enum(["slack", "web"]);

const inputSchema = z.object({
  action: eveAction,
  appRoot: z
    .string()
    .min(1)
    .default(".")
    .describe("Workspace-relative Eve app root."),
  channelKind: channelKind.optional(),
  evalIds: z.array(z.string().min(1)).default([]),
  skipReport: z.boolean().default(true),
});

export default defineTool({
  description:
    "Run documented Eve CLI operations in the sandbox. Use this for eve info, build, eval, or channels add. Do not use it for deploy or link; those go through run_vercel_cli so approval and brokered Vercel auth are applied.",
  inputSchema,
  async execute(input, ctx) {
    const command = buildEveCommand(input);
    return await runSandboxCommand(ctx, inAppRoot(input.appRoot, command));
  },
  toModelOutput: toCliModelOutput,
});

function buildEveCommand(input: z.infer<typeof inputSchema>): string {
  switch (input.action) {
    case "info":
      return "npx eve info --json";
    case "build":
      return "npx eve build";
    case "eval":
      return buildEvalCommand(input);
    case "channels_add":
      return buildChannelsAddCommand(input);
  }
}

function buildEvalCommand(input: z.infer<typeof inputSchema>): string {
  const ids = input.evalIds.map(shellQuote).join(" ");
  const reportFlag = input.skipReport ? " --skip-report" : "";
  return `npx eve eval${ids ? ` ${ids}` : ""}${reportFlag}`;
}

function buildChannelsAddCommand(input: z.infer<typeof inputSchema>): string {
  if (!input.channelKind) {
    throw new Error("channelKind is required when action is channels_add.");
  }

  return `npx eve channels add ${shellQuote(input.channelKind)} -y`;
}
