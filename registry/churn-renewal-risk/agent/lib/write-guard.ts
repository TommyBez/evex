export type ApprovalGrant = {
  readonly accountId: string;
  readonly confirmWrite: true;
  readonly issuedAt: string;
  readonly source: "draft_save_play";
};

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isCrmMutationMethod(method: string): boolean {
  return MUTATION_METHODS.has(method.trim().toUpperCase());
}

export function createApprovalGrant(input: {
  readonly accountId: string;
  readonly confirmWrite: boolean;
  readonly now?: string;
}): ApprovalGrant {
  if (!input.confirmWrite) {
    throw new Error(
      "Refused write grant. confirmWrite must be true on draft_save_play after Eve human approval.",
    );
  }
  const accountId = input.accountId.trim();
  if (!accountId) {
    throw new Error("Refused write grant. accountId is required.");
  }
  return {
    accountId,
    confirmWrite: true,
    issuedAt: input.now ?? new Date().toISOString(),
    source: "draft_save_play",
  };
}

export function assertApprovalGrant(
  grant: ApprovalGrant | undefined,
  accountId: string,
): asserts grant is ApprovalGrant {
  if (!grant) {
    throw new Error(
      "Refused CRM write. An ApprovalGrant from draft_save_play is required. There is no silent note write path.",
    );
  }
  if (grant.source !== "draft_save_play") {
    throw new Error(
      "Refused CRM write. Only draft_save_play can issue an ApprovalGrant.",
    );
  }
  if (grant.confirmWrite !== true) {
    throw new Error("Refused CRM write. confirmWrite must be true.");
  }
  if (grant.accountId !== accountId) {
    throw new Error(
      `Refused CRM write. Grant account ${grant.accountId} does not match ${accountId}.`,
    );
  }
}

export function isReadOnlyCrmPost(url: string): boolean {
  return /\/crm\/v3\/objects\/[^/?#]+\/search(?:\?|#|$)/i.test(url);
}

export function assertReadOnlyRequest(method: string, url: string): void {
  const normalized = method.trim().toUpperCase();
  if (normalized === "POST" && isReadOnlyCrmPost(url)) {
    return;
  }
  if (isCrmMutationMethod(normalized)) {
    throw new Error(
      `Refused ${normalized} ${url}: scan and health are read-only. CRM writes go through draft_save_play after Eve approval.`,
    );
  }
}

export function assertApprovedMutation(
  method: string,
  url: string,
  grant: ApprovalGrant | undefined,
  accountId: string,
): void {
  if (!isCrmMutationMethod(method)) {
    return;
  }
  assertApprovalGrant(grant, accountId);
  if (!url.trim()) {
    throw new Error("Refused CRM write. Mutation URL is required.");
  }
}
