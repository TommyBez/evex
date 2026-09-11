import { DEFAULT_SANDBOX_ROOTS, rfpResponseConfig } from "./rfp-config";

export function normalizeSandboxPath(input: string): string {
  const trimmed = input.trim().replaceAll("\\", "/");
  const withoutWorkspace = trimmed
    .replace(/^\/workspace\//, "")
    .replace(/^\.\//, "");
  return withoutWorkspace.replace(/^\/+/, "").replace(/\/+$/, "");
}

export function isAllowedSandboxPath(
  input: string,
  roots: readonly string[] = rfpResponseConfig.sandboxRoots,
): boolean {
  const relative = normalizeSandboxPath(input);
  if (relative.length === 0 || relative.includes("..")) {
    return false;
  }

  for (const root of roots) {
    const normalizedRoot = normalizeSandboxPath(root);
    if (normalizedRoot.length === 0) {
      continue;
    }
    if (
      relative === normalizedRoot ||
      relative.startsWith(`${normalizedRoot}/`)
    ) {
      return true;
    }
  }

  return false;
}

export function configuredSandboxRoots(): readonly string[] {
  return rfpResponseConfig.sandboxRoots.length > 0
    ? rfpResponseConfig.sandboxRoots
    : [...DEFAULT_SANDBOX_ROOTS];
}
