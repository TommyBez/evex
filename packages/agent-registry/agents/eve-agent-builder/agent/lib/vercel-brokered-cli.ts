import type { SandboxCommandResult, SandboxSession } from "eve/sandbox";
import type { SandboxNetworkPolicy } from "eve/sandbox";
import type { ToolContext } from "eve/tools";

export const BROKERED_VERCEL_TOKEN_PLACEHOLDER = "brokeredverceltoken";
const OUTPUT_PREVIEW_LENGTH = 6000;

export interface CliCommandResult {
  brokeredVercelAuth: boolean;
  command: string;
  exitCode: number;
  stderr: string;
  stdout: string;
}

export interface CliModelOutput {
  brokeredVercelAuth: boolean;
  command: string;
  exitCode: number;
  stderrPreview: string;
  stdoutPreview: string;
}

export function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\"'\"'")}'`;
}

export function inAppRoot(appRoot: string, command: string): string {
  return `cd ${shellQuote(appRoot)} && ${command}`;
}

export function toCliCommandResult({
  brokeredVercelAuth,
  command,
  result,
}: {
  brokeredVercelAuth: boolean;
  command: string;
  result: SandboxCommandResult;
}): CliCommandResult {
  return {
    brokeredVercelAuth,
    command,
    exitCode: result.exitCode,
    stderr: result.stderr,
    stdout: result.stdout,
  };
}

export function toCliModelOutput(output: CliCommandResult): {
  type: "json";
  value: CliModelOutput;
} {
  return {
    type: "json",
    value: {
      brokeredVercelAuth: output.brokeredVercelAuth,
      command: output.command,
      exitCode: output.exitCode,
      stderrPreview: tail(output.stderr),
      stdoutPreview: tail(output.stdout),
    },
  };
}

export async function runSandboxCommand(
  ctx: ToolContext,
  command: string,
): Promise<CliCommandResult> {
  const sandbox = await ctx.getSandbox();
  const result = await sandbox.run({ command });
  return toCliCommandResult({
    brokeredVercelAuth: false,
    command,
    result,
  });
}

export async function runBrokeredVercelCommand(
  ctx: ToolContext,
  command: string,
): Promise<CliCommandResult> {
  const sandbox = await ctx.getSandbox();
  await applyVercelCredentialBroker(sandbox);
  const result = await sandbox.run({ command });
  return toCliCommandResult({
    brokeredVercelAuth: true,
    command,
    result,
  });
}

async function applyVercelCredentialBroker(
  sandbox: SandboxSession,
): Promise<void> {
  const token = readVercelToken();

  if (!token) {
    throw new Error(
      "VERCEL_TOKEN is required in the app runtime to broker Vercel CLI authentication.",
    );
  }

  const authorization = `Bearer ${token}`;
  const vercelAuthRule = [
    {
      match: {
        headers: [
          {
            key: { exact: "authorization" },
            value: { exact: `Bearer ${BROKERED_VERCEL_TOKEN_PLACEHOLDER}` },
          },
        ],
      },
      transform: [
        {
          headers: {
            authorization,
          },
        },
      ],
    },
  ];

  const policy = {
    allow: {
      "api.vercel.com": vercelAuthRule,
      "vercel.com": vercelAuthRule,
      "*.vercel.com": vercelAuthRule,
      "*": [],
    },
    subnets: {
      deny: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
    },
  } satisfies SandboxNetworkPolicy;

  await sandbox.setNetworkPolicy(policy);
}

function readVercelToken(): string | undefined {
  return process.env.VERCEL_TOKEN;
}

function tail(value: string): string {
  if (value.length <= OUTPUT_PREVIEW_LENGTH) {
    return value;
  }

  return value.slice(value.length - OUTPUT_PREVIEW_LENGTH);
}
