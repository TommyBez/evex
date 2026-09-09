import type { CrmHygieneConfig } from "../crm-config";
import type { CrmRecord, HygieneProposal } from "../hygiene";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  SALESFORCE_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { crmFetch, readJson } from "./http";
import type { CrmClient } from "./types";

type SalesforceContact = {
  readonly Id: string;
  readonly Email?: string;
  readonly FirstName?: string;
  readonly LastName?: string;
  readonly Phone?: string;
  readonly Account?: { readonly Name?: string };
  readonly Website?: string;
};

const toRecord = (contact: SalesforceContact): CrmRecord => ({
  id: contact.Id,
  email: contact.Email,
  firstName: contact.FirstName,
  lastName: contact.LastName,
  phone: contact.Phone,
  company: contact.Account?.Name,
  website: contact.Website,
});

const fieldsOf = (after: HygieneProposal["after"]): Record<string, string> => {
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
  if (after.website) {
    fields.Website = after.website;
  }
  return fields;
};

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
        if (proposal.kind === "dedupe" && proposal.mergeRecordId) {
          await crmFetch({
            fetchImpl,
            url: `${instanceUrl}/services/data/v61.0/merge/`,
            method: "POST",
            headers: await headers(),
            body: JSON.stringify({
              masterRecord: {
                attributes: { type: "Contact" },
                Id: proposal.recordId,
              },
              recordToMergeIds: [proposal.mergeRecordId],
            }),
            grant,
            batchId,
          });
          applied.push(proposal.id);
          continue;
        }

        const fields = fieldsOf(proposal.after);
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
      }
      return { written: true as const, applied };
    },
  };
}
