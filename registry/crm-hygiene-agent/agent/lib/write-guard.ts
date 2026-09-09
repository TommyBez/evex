export type ApprovalGrant = {
  readonly batchId: string;
  readonly confirmWrite: true;
  readonly issuedAt: string;
  readonly source: "apply_hygiene_writes";
};

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isCrmMutationMethod(method: string): boolean {
  return MUTATION_METHODS.has(method.trim().toUpperCase());
}

export function createApprovalGrant(input: {
  readonly batchId: string;
  readonly confirmWrite: boolean;
  readonly now?: string;
}): ApprovalGrant {
  if (!input.confirmWrite) {
    throw new Error(
      "Refused write grant. confirmWrite must be true on apply_hygiene_writes after Eve human approval.",
    );
  }
  const batchId = input.batchId.trim();
  if (!batchId) {
    throw new Error("Refused write grant. batchId is required.");
  }
  return {
    batchId,
    confirmWrite: true,
    issuedAt: input.now ?? new Date().toISOString(),
    source: "apply_hygiene_writes",
  };
}

export function assertApprovalGrant(
  grant: ApprovalGrant | undefined,
  batchId: string,
): asserts grant is ApprovalGrant {
  if (!grant) {
    throw new Error(
      "Refused CRM write. An ApprovalGrant from apply_hygiene_writes is required. There is no auto-merge or silent overwrite path.",
    );
  }
  if (grant.source !== "apply_hygiene_writes") {
    throw new Error(
      "Refused CRM write. Only apply_hygiene_writes can issue an ApprovalGrant.",
    );
  }
  if (grant.confirmWrite !== true) {
    throw new Error("Refused CRM write. confirmWrite must be true.");
  }
  if (grant.batchId !== batchId) {
    throw new Error(
      `Refused CRM write. Grant batch ${grant.batchId} does not match ${batchId}.`,
    );
  }
}

export function assertReadOnlyRequest(method: string, url: string): void {
  if (isCrmMutationMethod(method)) {
    throw new Error(
      `Refused ${method} ${url}: scan and propose are read-only. CRM writes go through apply_hygiene_writes after Eve approval.`,
    );
  }
}

export function assertApprovedMutation(
  method: string,
  url: string,
  grant: ApprovalGrant | undefined,
  batchId: string,
): void {
  if (!isCrmMutationMethod(method)) {
    return;
  }
  assertApprovalGrant(grant, batchId);
  if (!url.trim()) {
    throw new Error("Refused CRM write. Mutation URL is required.");
  }
}
