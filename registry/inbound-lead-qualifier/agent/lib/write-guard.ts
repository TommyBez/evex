export type ApprovalGrant = {
  readonly leadId: string;
  readonly confirmWrite: true;
  readonly issuedAt: string;
  readonly source: "draft_crm_note";
};

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isCrmMutationMethod(method: string): boolean {
  return MUTATION_METHODS.has(method.trim().toUpperCase());
}

export function createApprovalGrant(input: {
  readonly leadId: string;
  readonly confirmWrite: boolean;
  readonly now?: string;
}): ApprovalGrant {
  if (!input.confirmWrite) {
    throw new Error(
      "Refused write grant. confirmWrite must be true on draft_crm_note after Eve human approval.",
    );
  }
  const leadId = input.leadId.trim();
  if (!leadId) {
    throw new Error("Refused write grant. leadId is required.");
  }
  return {
    leadId,
    confirmWrite: true,
    issuedAt: input.now ?? new Date().toISOString(),
    source: "draft_crm_note",
  };
}

export function assertApprovalGrant(
  grant: ApprovalGrant | undefined,
  leadId: string,
): asserts grant is ApprovalGrant {
  if (!grant) {
    throw new Error(
      "Refused CRM write. An ApprovalGrant from draft_crm_note is required. There is no silent contact or note write path.",
    );
  }
  if (grant.source !== "draft_crm_note") {
    throw new Error(
      "Refused CRM write. Only draft_crm_note can issue an ApprovalGrant.",
    );
  }
  if (grant.confirmWrite !== true) {
    throw new Error("Refused CRM write. confirmWrite must be true.");
  }
  if (grant.leadId !== leadId) {
    throw new Error(
      `Refused CRM write. Grant lead ${grant.leadId} does not match ${leadId}.`,
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
      `Refused ${normalized} ${url}: list and enrich are read-only. CRM writes go through draft_crm_note after Eve approval.`,
    );
  }
}

export function assertApprovedMutation(
  method: string,
  url: string,
  grant: ApprovalGrant | undefined,
  leadId: string,
): void {
  if (!isCrmMutationMethod(method)) {
    return;
  }
  assertApprovalGrant(grant, leadId);
  if (!url.trim()) {
    throw new Error("Refused CRM write. Mutation URL is required.");
  }
}
