import type { InboundLeadConfig } from "../lead-config";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  SALESFORCE_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { ApprovalGrant } from "../write-guard";
import { crmFetch, readJson } from "./http";
import type { CrmClient, CrmLeadRecord, CrmNoteDraft } from "./types";

type SalesforceContact = {
  readonly Id: string;
  readonly Email?: string;
  readonly FirstName?: string;
  readonly LastName?: string;
  readonly Phone?: string;
  readonly Title?: string;
  readonly CreatedDate?: string;
  readonly Account?: { readonly Name?: string };
};

const toRecord = (contact: SalesforceContact): CrmLeadRecord => ({
  id: contact.Id,
  email: contact.Email,
  firstName: contact.FirstName,
  lastName: contact.LastName,
  phone: contact.Phone,
  title: contact.Title,
  company: contact.Account?.Name,
  submittedAt: contact.CreatedDate,
  source: "crm",
});

const SALESFORCE_DATETIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})$/;
const DEFAULT_SALESFORCE_PAGE_SIZE = 50;
const MAX_SALESFORCE_PAGE_SIZE = 200;

export function escapeSoql(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

export function toSalesforceDateTime(since: string): string | undefined {
  const trimmed = since.trim();
  const normalized = trimmed.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  if (!SALESFORCE_DATETIME.test(normalized)) {
    return undefined;
  }
  const parsed = Date.parse(normalized);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return new Date(parsed).toISOString();
}

export function clampSalesforceLimit(max: number): number {
  if (!Number.isInteger(max) || max < 1) {
    return DEFAULT_SALESFORCE_PAGE_SIZE;
  }
  return Math.min(max, MAX_SALESFORCE_PAGE_SIZE);
}

export function buildSalesforceCreatedSinceQuery(
  since: string,
  max: number,
): string | undefined {
  const iso = toSalesforceDateTime(since);
  if (!iso) {
    return undefined;
  }
  return `SELECT Id, Email, FirstName, LastName, Phone, Title, CreatedDate, Account.Name FROM Contact WHERE CreatedDate > ${iso} ORDER BY CreatedDate ASC LIMIT ${clampSalesforceLimit(max)}`;
}

export function createSalesforceClient(
  config: InboundLeadConfig,
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
    async listNewSince({ since, seenIds, max = 50 }) {
      const soql = buildSalesforceCreatedSinceQuery(since, max);
      if (!soql) {
        return [];
      }
      const query = encodeURIComponent(soql);
      const response = await crmFetch({
        fetchImpl,
        url: `${instanceUrl}/services/data/v59.0/query?q=${query}`,
        method: "GET",
        headers: await headers(),
      });
      const body = await readJson<{ records?: SalesforceContact[] }>(response);
      return (body.records ?? [])
        .map(toRecord)
        .filter((record) => !seenIds.includes(record.id));
    },
    async findContactByEmail(email) {
      const query = encodeURIComponent(
        `SELECT Id, Email, FirstName, LastName, Phone, Title, CreatedDate, Account.Name FROM Contact WHERE Email = '${escapeSoql(email)}' LIMIT 1`,
      );
      const response = await crmFetch({
        fetchImpl,
        url: `${instanceUrl}/services/data/v59.0/query?q=${query}`,
        method: "GET",
        headers: await headers(),
      });
      const body = await readJson<{ records?: SalesforceContact[] }>(response);
      const first = body.records?.[0];
      return first ? toRecord(first) : null;
    },
    async upsertContactAndNote({ draft, grant }) {
      return writeSalesforceNote({
        fetchImpl,
        headers,
        instanceUrl,
        draft,
        grant,
      });
    },
  };
}

async function writeSalesforceNote(input: {
  readonly fetchImpl: FetchLike;
  readonly headers: () => Promise<Record<string, string>>;
  readonly instanceUrl: string;
  readonly draft: CrmNoteDraft;
  readonly grant: ApprovalGrant;
}): Promise<{
  readonly written: true;
  readonly contactId: string;
  readonly noteId?: string;
}> {
  const auth = await input.headers();
  const existing = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: `${input.instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(
      `SELECT Id FROM Contact WHERE Email = '${escapeSoql(input.draft.email)}' LIMIT 1`,
    )}`,
    method: "GET",
    headers: auth,
  });
  const found = (await readJson<{ records?: { Id?: string }[] }>(existing))
    .records?.[0]?.Id;

  const fields = {
    Email: input.draft.email,
    FirstName: input.draft.firstName,
    LastName: input.draft.lastName,
    Title: input.draft.title,
    Phone: input.draft.phone,
  };

  let contactId = found ?? input.draft.leadId;
  if (found) {
    await crmFetch({
      fetchImpl: input.fetchImpl,
      url: `${input.instanceUrl}/services/data/v59.0/sobjects/Contact/${found}`,
      method: "PATCH",
      headers: auth,
      body: JSON.stringify(fields),
      grant: input.grant,
      leadId: input.draft.leadId,
    });
  } else {
    const created = await crmFetch({
      fetchImpl: input.fetchImpl,
      url: `${input.instanceUrl}/services/data/v59.0/sobjects/Contact`,
      method: "POST",
      headers: auth,
      body: JSON.stringify({ ...fields, LastName: fields.LastName ?? "Lead" }),
      grant: input.grant,
      leadId: input.draft.leadId,
    });
    const body = await readJson<{ id?: string }>(created);
    contactId = body.id ?? contactId;
  }

  const note = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: `${input.instanceUrl}/services/data/v59.0/sobjects/Task`,
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      WhoId: contactId,
      Subject: "Inbound lead qualification",
      Description: input.draft.body,
      Status: "Completed",
    }),
    grant: input.grant,
    leadId: input.draft.leadId,
  });
  const noteBody = await readJson<{ id?: string }>(note);
  return { written: true, contactId, noteId: noteBody.id };
}
