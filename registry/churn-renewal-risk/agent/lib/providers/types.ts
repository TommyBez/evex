import type { RenewalAccount } from "../score";
import type { ApprovalGrant } from "../write-guard";

export type CrmNoteDraft = {
  readonly accountId: string;
  readonly name: string;
  readonly ownerEmail?: string;
  readonly body: string;
};

export type CrmClient = {
  readonly provider: "hubspot" | "salesforce";
  listRenewalAccounts(input: {
    readonly lookaheadDays: number;
    readonly max: number;
    readonly now?: Date;
  }): Promise<readonly RenewalAccount[]>;
  writeAccountNote(input: {
    readonly draft: CrmNoteDraft;
    readonly grant: ApprovalGrant;
  }): Promise<{
    readonly written: true;
    readonly accountId: string;
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
