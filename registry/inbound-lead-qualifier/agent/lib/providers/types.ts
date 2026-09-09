import type { LeadFields } from "../untrusted";
import type { ApprovalGrant } from "../write-guard";

export type CrmLeadRecord = LeadFields & {
  readonly id: string;
};

export type CrmNoteDraft = {
  readonly leadId: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly company?: string;
  readonly title?: string;
  readonly phone?: string;
  readonly body: string;
};

export type CrmClient = {
  readonly provider: "hubspot" | "salesforce" | "pipedrive";
  listNewSince(input: {
    readonly since: string;
    readonly seenIds: readonly string[];
    readonly max?: number;
  }): Promise<readonly CrmLeadRecord[]>;
  findContactByEmail(email: string): Promise<CrmLeadRecord | null>;
  upsertContactAndNote(input: {
    readonly draft: CrmNoteDraft;
    readonly grant: ApprovalGrant;
  }): Promise<{
    readonly written: true;
    readonly contactId: string;
    readonly noteId?: string;
  }>;
};

export type CrmClientResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false;
      readonly note: string;
      readonly missingEnv: readonly string[];
    };
