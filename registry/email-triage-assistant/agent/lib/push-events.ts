export type PushTrigger = {
  readonly source: "gmail" | "outlook" | "generic";
  readonly reason: "push";
  readonly hint: string;
};

export function parsePushEvent(input: {
  readonly searchParams?: URLSearchParams;
  readonly body?: unknown;
}): PushTrigger | { readonly validationToken: string } | { readonly ignored: true } {
  const validationToken = input.searchParams?.get("validationToken");
  if (validationToken) {
    return { validationToken };
  }

  const body = asRecord(input.body);
  const encoded = asRecord(body.message)?.data;
  if (typeof encoded === "string" && encoded.length > 0) {
    return {
      source: "gmail",
      reason: "push",
      hint: "Gmail history notification",
    };
  }

  if (typeof body.subscriptionId === "string" || Array.isArray(body.value)) {
    return {
      source: "outlook",
      reason: "push",
      hint: "Microsoft Graph change notification",
    };
  }

  if (body.reason === "push" || body.type === "inbox.push") {
    return {
      source: "generic",
      reason: "push",
      hint: "Inbox push webhook",
    };
  }

  return { ignored: true };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
