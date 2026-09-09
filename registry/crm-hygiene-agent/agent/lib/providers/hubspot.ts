import type { CrmHygieneConfig } from "../crm-config";
import type { CrmRecord, HygieneProposal } from "../hygiene";
import {
  createAccessTokenCache,
  HUBSPOT_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { PartialWriteError, type ApprovalGrant } from "../write-guard";
import { crmFetch, readJson } from "./http";
import type { CrmClient } from "./types";

export const HUBSPOT_MAX_PAGE_SIZE = 100;

type HubSpotContact = {
  readonly id: string;
  readonly properties?: {
    readonly email?: string;
    readonly firstname?: string;
    readonly lastname?: string;
    readonly phone?: string;
    readonly company?: string;
    readonly website?: string;
  };
};

const toRecord = (contact: HubSpotContact): CrmRecord => ({
  id: contact.id,
  email: contact.properties?.email,
  firstName: contact.properties?.firstname,
  lastName: contact.properties?.lastname,
  phone: contact.properties?.phone,
  company: contact.properties?.company,
  website: contact.properties?.website,
});

const propertiesOf = (after: HygieneProposal["after"]): Record<string, string> => {
  const properties: Record<string, string> = {};
  if (after.email) {
    properties.email = after.email;
  }
  if (after.firstName) {
    properties.firstname = after.firstName;
  }
  if (after.lastName) {
    properties.lastname = after.lastName;
  }
  if (after.phone) {
    properties.phone = after.phone;
  }
  if (after.company) {
    properties.company = after.company;
  }
  if (after.website) {
    properties.website = after.website;
  }
  return properties;
};

export function createHubSpotClient(
  config: CrmHygieneConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): CrmClient {
  const connectUid = config.hubspot.connectUid ?? "";
  const token = createAccessTokenCache(() =>
    mintConnectAccessToken({
      connectorUid: connectUid,
      scopes: HUBSPOT_CONNECT_SCOPES,
      mintImpl,
    }),
  );

  const headers = async (): Promise<Record<string, string>> => ({
    Authorization: `Bearer ${await token()}`,
    "Content-Type": "application/json",
  });

  return {
    provider: "hubspot",
    async listRecords({ max }) {
      const collected: CrmRecord[] = [];
      let after: string | undefined;
      while (collected.length < max) {
        const limit = Math.min(HUBSPOT_MAX_PAGE_SIZE, max - collected.length);
        const params = new URLSearchParams({
          limit: String(limit),
          properties: "email,firstname,lastname,phone,company,website",
        });
        if (after) {
          params.set("after", after);
        }
        const response = await crmFetch({
          fetchImpl,
          url: `https://api.hubapi.com/crm/v3/objects/contacts?${params.toString()}`,
          method: "GET",
          headers: await headers(),
        });
        const body = await readJson<{
          results?: HubSpotContact[];
          paging?: { readonly next?: { readonly after?: string } };
        }>(response);
        const page = (body.results ?? []).map(toRecord);
        collected.push(...page);
        after = body.paging?.next?.after;
        if (!after || page.length === 0) {
          break;
        }
      }
      return collected.slice(0, max);
    },
    async applyWrites({ batchId, proposals, grant }) {
      const applied: string[] = [];
      for (const proposal of proposals) {
        try {
          if (proposal.kind === "dedupe" && proposal.mergeRecordId) {
            await crmFetch({
              fetchImpl,
              url: "https://api.hubapi.com/crm/v3/objects/contacts/merge",
              method: "POST",
              headers: await headers(),
              body: JSON.stringify({
                primaryObjectId: proposal.recordId,
                objectIdToMerge: proposal.mergeRecordId,
              }),
              grant,
              batchId,
            });
            applied.push(proposal.id);
            continue;
          }

          const properties = propertiesOf(proposal.after);
          if (Object.keys(properties).length === 0) {
            continue;
          }
          await crmFetch({
            fetchImpl,
            url: `https://api.hubapi.com/crm/v3/objects/contacts/${proposal.recordId}`,
            method: "PATCH",
            headers: await headers(),
            body: JSON.stringify({ properties }),
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

export function hubspotWriteRequiresGrant(
  grant: ApprovalGrant | undefined,
): boolean {
  return Boolean(grant?.confirmWrite && grant.source === "apply_hygiene_writes");
}
