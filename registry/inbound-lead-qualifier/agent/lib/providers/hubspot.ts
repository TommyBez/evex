import type { InboundLeadConfig } from "../lead-config";
import {
  createAccessTokenCache,
  HUBSPOT_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { ApprovalGrant } from "../write-guard";
import { crmFetch, readJson } from "./http";
import type { CrmClient, CrmLeadRecord, CrmNoteDraft } from "./types";

export const HUBSPOT_MAX_PAGE_SIZE = 100;

type HubSpotContact = {
  readonly id: string;
  readonly createdAt?: string;
  readonly properties?: {
    readonly email?: string;
    readonly firstname?: string;
    readonly lastname?: string;
    readonly phone?: string;
    readonly company?: string;
    readonly jobtitle?: string;
  };
};

const toRecord = (contact: HubSpotContact): CrmLeadRecord => ({
  id: contact.id,
  email: contact.properties?.email,
  firstName: contact.properties?.firstname,
  lastName: contact.properties?.lastname,
  phone: contact.properties?.phone,
  company: contact.properties?.company,
  title: contact.properties?.jobtitle,
  submittedAt: contact.createdAt,
  source: "crm",
});

const contactProperties =
  "email,firstname,lastname,phone,company,jobtitle,createdate";

export function createHubSpotClient(
  config: InboundLeadConfig,
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
    async listNewSince({ since, seenIds, max = 50 }) {
      const collected: CrmLeadRecord[] = [];
      let after: string | undefined;
      while (collected.length < max) {
        const limit = Math.min(HUBSPOT_MAX_PAGE_SIZE, max - collected.length);
        const params = new URLSearchParams({
          limit: String(limit),
          properties: contactProperties,
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
        const page = (body.results ?? [])
          .map(toRecord)
          .filter(
            (record) =>
              !seenIds.includes(record.id) &&
              (!record.submittedAt || record.submittedAt > since),
          );
        collected.push(...page);
        after = body.paging?.next?.after;
        if (!after || (body.results ?? []).length === 0) {
          break;
        }
      }
      return collected.slice(0, max);
    },
    async findContactByEmail(email) {
      const response = await crmFetch({
        fetchImpl,
        url: `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email&properties=${contactProperties}`,
        method: "GET",
        headers: await headers(),
      });
      if (response.status === 404) {
        return null;
      }
      const body = await readJson<HubSpotContact>(response);
      return toRecord(body);
    },
    async upsertContactAndNote({ draft, grant }) {
      return writeHubSpotNote({ fetchImpl, headers, draft, grant });
    },
  };
}

async function writeHubSpotNote(input: {
  readonly fetchImpl: FetchLike;
  readonly headers: () => Promise<Record<string, string>>;
  readonly draft: CrmNoteDraft;
  readonly grant: ApprovalGrant;
}): Promise<{
  readonly written: true;
  readonly contactId: string;
  readonly noteId?: string;
}> {
  const auth = await input.headers();
  const lookup = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(input.draft.email)}?idProperty=email&properties=email`,
    method: "GET",
    headers: auth,
  });
  const found =
    lookup.status === 404
      ? null
      : (await readJson<HubSpotContact>(lookup)).id;

  const properties = {
    email: input.draft.email,
    firstname: input.draft.firstName,
    lastname: input.draft.lastName,
    company: input.draft.company,
    jobtitle: input.draft.title,
    phone: input.draft.phone,
  };

  let contactId = found ?? input.draft.leadId;
  if (found) {
    await crmFetch({
      fetchImpl: input.fetchImpl,
      url: `https://api.hubapi.com/crm/v3/objects/contacts/${found}`,
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ properties }),
      grant: input.grant,
      leadId: input.draft.leadId,
    });
  } else {
    const created = await crmFetch({
      fetchImpl: input.fetchImpl,
      url: "https://api.hubapi.com/crm/v3/objects/contacts",
      method: "POST",
      headers: auth,
      body: JSON.stringify({ properties }),
      grant: input.grant,
      leadId: input.draft.leadId,
    });
    const body = await readJson<{ id?: string }>(created);
    contactId = body.id ?? contactId;
  }

  const note = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: "https://api.hubapi.com/crm/v3/objects/notes",
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      properties: {
        hs_note_body: input.draft.body,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 202,
            },
          ],
        },
      ],
    }),
    grant: input.grant,
    leadId: input.draft.leadId,
  });
  const noteBody = await readJson<{ id?: string }>(note);
  return { written: true, contactId, noteId: noteBody.id };
}
