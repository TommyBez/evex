import type { ChurnRenewalConfig } from "../renewal-config";
import {
  createAccessTokenCache,
  HUBSPOT_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { RenewalAccount } from "../score";
import { sanitizeText } from "../untrusted";
import type { ApprovalGrant } from "../write-guard";
import { crmFetch, readJson } from "./http";
import type { CrmClient, CrmNoteDraft } from "./types";

export const HUBSPOT_MAX_PAGE_SIZE = 100;
export const HUBSPOT_NOTE_TO_COMPANY_ASSOCIATION = 190;

type HubSpotCompany = {
  readonly id: string;
  readonly properties?: Record<string, string | undefined>;
};

const toAccount = (
  company: HubSpotCompany,
  renewalProperty: string,
  stripeCustomerProperty: string,
): RenewalAccount => ({
  id: company.id,
  name: sanitizeText(company.properties?.name, 160) ?? company.id,
  ownerEmail: sanitizeText(company.properties?.hubspot_owner_email, 254),
  ownerName: sanitizeText(company.properties?.hubspot_owner_name, 80),
  renewalDate: sanitizeText(company.properties?.[renewalProperty], 40),
  stripeCustomerId: sanitizeText(
    company.properties?.[stripeCustomerProperty],
    80,
  ),
  domain: sanitizeText(company.properties?.domain, 160),
});

export function buildHubSpotRenewalSearch(
  lookaheadDays: number,
  max: number,
  renewalProperty: string,
  stripeCustomerProperty: string,
  now = new Date(),
): {
  readonly filterGroups: readonly {
    readonly filters: readonly {
      readonly propertyName: string;
      readonly operator: string;
      readonly value: string;
      readonly highValue?: string;
    }[];
  }[];
  readonly sorts: readonly {
    readonly propertyName: string;
    readonly direction: "ASCENDING";
  }[];
  readonly properties: readonly string[];
  readonly limit: number;
} {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const end = start + lookaheadDays * 86_400_000;
  return {
    filterGroups: [
      {
        filters: [
          {
            propertyName: renewalProperty,
            operator: "BETWEEN",
            value: String(start),
            highValue: String(end),
          },
        ],
      },
    ],
    sorts: [
      {
        propertyName: renewalProperty,
        direction: "ASCENDING",
      },
    ],
    properties: [
      "name",
      "domain",
      renewalProperty,
      stripeCustomerProperty,
    ],
    limit: Math.min(Math.max(max, 1), HUBSPOT_MAX_PAGE_SIZE),
  };
}

export function createHubSpotClient(
  config: ChurnRenewalConfig,
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
    async listRenewalAccounts({ lookaheadDays, max, now }) {
      const collected: RenewalAccount[] = [];
      let after: string | undefined;
      while (collected.length < max) {
        const response = await crmFetch({
          fetchImpl,
          url: "https://api.hubapi.com/crm/v3/objects/companies/search",
          method: "POST",
          headers: await headers(),
          body: JSON.stringify({
            ...buildHubSpotRenewalSearch(
              lookaheadDays,
              max - collected.length,
              config.hubspot.renewalProperty,
              config.hubspot.stripeCustomerProperty,
              now,
            ),
            after,
          }),
        });
        const body = await readJson<{
          results?: HubSpotCompany[];
          paging?: { readonly next?: { readonly after?: string } };
        }>(response);
        const page = (body.results ?? []).map((company) =>
          toAccount(
            company,
            config.hubspot.renewalProperty,
            config.hubspot.stripeCustomerProperty,
          ),
        );
        collected.push(...page);
        after = body.paging?.next?.after;
        if (!after || (body.results ?? []).length === 0) {
          break;
        }
      }
      return collected.slice(0, max);
    },
    async writeAccountNote({ draft, grant }) {
      return writeHubSpotCompanyNote({ fetchImpl, headers, draft, grant });
    },
  };
}

async function writeHubSpotCompanyNote(input: {
  readonly fetchImpl: FetchLike;
  readonly headers: () => Promise<Record<string, string>>;
  readonly draft: CrmNoteDraft;
  readonly grant: ApprovalGrant;
}): Promise<{
  readonly written: true;
  readonly accountId: string;
  readonly noteId?: string;
}> {
  const note = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: "https://api.hubapi.com/crm/v3/objects/notes",
    method: "POST",
    headers: await input.headers(),
    body: JSON.stringify({
      properties: {
        hs_note_body: input.draft.body,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: input.draft.accountId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: HUBSPOT_NOTE_TO_COMPANY_ASSOCIATION,
            },
          ],
        },
      ],
    }),
    grant: input.grant,
    accountId: input.draft.accountId,
  });
  const noteBody = await readJson<{ id?: string }>(note);
  return {
    written: true,
    accountId: input.draft.accountId,
    noteId: noteBody.id,
  };
}
