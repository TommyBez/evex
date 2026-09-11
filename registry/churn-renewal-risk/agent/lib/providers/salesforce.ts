import type { ChurnRenewalConfig } from "../renewal-config";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  SALESFORCE_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { utcDateStamp, type RenewalAccount } from "../score";
import { sanitizeText } from "../untrusted";
import type { ApprovalGrant } from "../write-guard";
import { crmFetch, readJson } from "./http";
import type { CrmClient, CrmNoteDraft } from "./types";

type SalesforceAccount = {
  readonly Id: string;
  readonly Name?: string;
  readonly Website?: string;
  readonly Owner?: { readonly Name?: string; readonly Email?: string };
  readonly [field: string]: unknown;
};

const SAFE_SOQL_FIELD = /^[A-Za-z][A-Za-z0-9_]{0,79}$/;
const DEFAULT_SALESFORCE_PAGE_SIZE = 50;
const MAX_SALESFORCE_PAGE_SIZE = 200;

export function escapeSoql(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

export function assertSoqlField(field: string): string {
  if (!SAFE_SOQL_FIELD.test(field)) {
    throw new Error("Salesforce field name is not a safe SOQL identifier.");
  }
  return field;
}

export function addUtcDays(start: Date, days: number): Date {
  return new Date(start.getTime() + days * 86_400_000);
}

export function clampSalesforceLimit(max: number): number {
  if (!Number.isInteger(max) || max < 1) {
    return DEFAULT_SALESFORCE_PAGE_SIZE;
  }
  return Math.min(max, MAX_SALESFORCE_PAGE_SIZE);
}

export function buildSalesforceRenewalQuery(input: {
  readonly renewalField: string;
  readonly stripeCustomerField: string;
  readonly lookaheadDays: number;
  readonly max: number;
  readonly now?: Date;
}): string {
  const renewalField = assertSoqlField(input.renewalField);
  const stripeField = assertSoqlField(input.stripeCustomerField);
  const now = input.now ?? new Date();
  const start = utcDateStamp(now);
  const end = utcDateStamp(addUtcDays(now, input.lookaheadDays));
  return `SELECT Id, Name, Website, Owner.Name, Owner.Email, ${renewalField}, ${stripeField} FROM Account WHERE ${renewalField} >= ${start} AND ${renewalField} <= ${end} ORDER BY ${renewalField} ASC LIMIT ${clampSalesforceLimit(input.max)}`;
}

const toAccount = (
  record: SalesforceAccount,
  renewalField: string,
  stripeCustomerField: string,
): RenewalAccount => ({
  id: record.Id,
  name: sanitizeText(record.Name, 160) ?? record.Id,
  ownerName: sanitizeText(record.Owner?.Name, 80),
  ownerEmail: sanitizeText(record.Owner?.Email, 254),
  renewalDate: sanitizeText(record[renewalField], 40),
  stripeCustomerId: sanitizeText(record[stripeCustomerField], 80),
  domain: sanitizeText(record.Website, 160),
});

export function createSalesforceClient(
  config: ChurnRenewalConfig,
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
    async listRenewalAccounts({ lookaheadDays, max, now }) {
      const soql = buildSalesforceRenewalQuery({
        renewalField: config.salesforce.renewalField,
        stripeCustomerField: config.salesforce.stripeCustomerField,
        lookaheadDays,
        max,
        now,
      });
      const response = await crmFetch({
        fetchImpl,
        url: `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(soql)}`,
        method: "GET",
        headers: await headers(),
      });
      const body = await readJson<{ records?: SalesforceAccount[] }>(response);
      return (body.records ?? []).map((record) =>
        toAccount(
          record,
          config.salesforce.renewalField,
          config.salesforce.stripeCustomerField,
        ),
      );
    },
    async writeAccountNote({ draft, grant }) {
      return writeSalesforceAccountNote({
        fetchImpl,
        headers,
        instanceUrl,
        draft,
        grant,
      });
    },
  };
}

async function writeSalesforceAccountNote(input: {
  readonly fetchImpl: FetchLike;
  readonly headers: () => Promise<Record<string, string>>;
  readonly instanceUrl: string;
  readonly draft: CrmNoteDraft;
  readonly grant: ApprovalGrant;
}): Promise<{
  readonly written: true;
  readonly accountId: string;
  readonly noteId?: string;
}> {
  const note = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: `${input.instanceUrl}/services/data/v59.0/sobjects/Task`,
    method: "POST",
    headers: await input.headers(),
    body: JSON.stringify({
      WhatId: input.draft.accountId,
      Subject: "Renewal save play",
      Description: input.draft.body,
      Status: "Completed",
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
