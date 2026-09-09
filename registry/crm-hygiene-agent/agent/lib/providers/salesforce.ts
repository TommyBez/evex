import type { CrmHygieneConfig } from "../crm-config";
import type { CrmRecord, HygieneProposal } from "../hygiene";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  SALESFORCE_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { PartialWriteError } from "../write-guard";
import { crmFetch, readJson } from "./http";
import type { CrmClient } from "./types";

export const SALESFORCE_MERGE_UNSUPPORTED =
  "Salesforce Contact merge is not supported over REST. Merge contacts in Salesforce, then approve normalize or enrich only.";

type SalesforceContact = {
  readonly Id: string;
  readonly Email?: string;
  readonly FirstName?: string;
  readonly LastName?: string;
  readonly Phone?: string;
  readonly Account?: { readonly Name?: string };
};

const toRecord = (contact: SalesforceContact): CrmRecord => ({
  id: contact.Id,
  email: contact.Email,
  firstName: contact.FirstName,
  lastName: contact.LastName,
  phone: contact.Phone,
  company: contact.Account?.Name,
});

export function salesforceContactFields(
  after: HygieneProposal["after"],
): Record<string, string> {
  const fields: Record<string, string> = {};
  if (after.email) {
    fields.Email = after.email;
  }
  if (after.firstName) {
    fields.FirstName = after.firstName;
  }
  if (after.lastName) {
    fields.LastName = after.lastName;
  }
  if (after.phone) {
    fields.Phone = after.phone;
  }
  return fields;
}

export function createSalesforceClient(
  config: CrmHygieneConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): CrmClient {
  const connectUid = config.salesforce.connectUid ?? "";
  const instanceUrl = (config.salesforce.instanceUrl ?? "").replace(/\/$/, "");
  const token = createAccessTokenCache(() =>
    mintConnectAccessToken({
      connectorUid: connectUid,
      scopes: SALESFORCE_CONNECT_SCOPES,
      mintImpl,
    }),
  );

  const headers = async (): Promise<Record<string, string>> => ({
    Authorization: `Bearer ${await token()}`,
    "Content-Type": "application/json",
  });

  return {
    provider: "salesforce",
    async listRecords({ max }) {
      const query = encodeURIComponent(
        `SELECT Id, Email, FirstName, LastName, Phone, Account.Name FROM Contact LIMIT ${max}`,
      );
      const response = await crmFetch({
        fetchImpl,
        url: `${instanceUrl}/services/data/v61.0/query?q=${query}`,
        method: "GET",
        headers: await headers(),
      });
      const body = await readJson<{ records?: SalesforceContact[] }>(response);
      return (body.records ?? []).slice(0, max).map(toRecord);
    },
    async applyWrites({ batchId, proposals, grant }) {
      const applied: string[] = [];
      for (const proposal of proposals) {
        try {
          if (proposal.kind === "dedupe") {
            throw new Error(SALESFORCE_MERGE_UNSUPPORTED);
          }

          const fields = salesforceContactFields(proposal.after);
          if (Object.keys(fields).length === 0) {
            continue;
          }
          await crmFetch({
            fetchImpl,
            url: `${instanceUrl}/services/data/v61.0/sobjects/Contact/${proposal.recordId}`,
            method: "PATCH",
            headers: await headers(),
            body: JSON.stringify(fields),
            grant,
            batchId,
          });
          applied.push(proposal.id);
        } catch (error) {
          throw new PartialWriteError(applied, error);
        }
      }
      return { written: true as const, applied };
    },
  };
}
