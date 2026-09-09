import type { CrmRecord, HygieneProposal } from "../hygiene";
import type { ApprovalGrant } from "../write-guard";

export type CrmClient = {
  readonly provider: "hubspot" | "salesforce" | "pipedrive";
  listRecords(input: { readonly max: number }): Promise<readonly CrmRecord[]>;
  applyWrites(input: {
    readonly batchId: string;
    readonly proposals: readonly HygieneProposal[];
    readonly grant: ApprovalGrant;
  }): Promise<{
    readonly written: true;
    readonly applied: readonly string[];
  }>;
};

export type CrmClientResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false;
      readonly note: string;
      readonly missingEnv: readonly string[];
    };
