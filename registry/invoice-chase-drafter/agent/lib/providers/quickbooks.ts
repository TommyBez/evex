import type { InvoiceChaseConfig } from "../chase-config";
import { parseMoney, withAging, type OpenInvoice } from "../aging";
import { readOnlyJson } from "../http";
import {
  createAccessTokenCache,
  QUICKBOOKS_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { ArClient } from "./types";

const QBO_MINOR = "65";

type QboRef = { readonly value?: string; readonly name?: string };
type QboInvoice = {
  readonly Id?: string;
  readonly DocNumber?: string;
  readonly Balance?: number | string;
  readonly TotalAmt?: number | string;
  readonly DueDate?: string;
  readonly TxnDate?: string;
  readonly CurrencyRef?: QboRef;
  readonly CustomerRef?: QboRef;
  readonly BillEmail?: { readonly Address?: string };
};

type QboQuery = {
  readonly QueryResponse?: { readonly Invoice?: readonly QboInvoice[] };
};

type QboRead = { readonly Invoice?: QboInvoice };

export function quickbooksApiOrigin(
  environment: "production" | "sandbox",
): string {
  return environment === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";
}

const toInvoice = (
  row: QboInvoice,
  now = new Date(),
): OpenInvoice | null => {
  if (!row.Id) {
    return null;
  }
  return withAging(
    {
      id: row.Id,
      provider: "quickbooks",
      number: row.DocNumber ?? row.Id,
      customerName: row.CustomerRef?.name ?? "Customer",
      email: row.BillEmail?.Address?.trim() || undefined,
      balance: parseMoney(row.Balance),
      total: parseMoney(row.TotalAmt),
      dueDate: row.DueDate,
      issuedDate: row.TxnDate,
      currency: row.CurrencyRef?.value,
      status: parseMoney(row.Balance) > 0 ? "OPEN" : "PAID",
    },
    now,
  );
};

export function createQuickBooksClient(
  config: InvoiceChaseConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): ArClient {
  const connectUid = config.quickbooks.connectUid ?? "";
  const realmId = config.quickbooks.realmId ?? "";
  const origin = quickbooksApiOrigin(config.quickbooks.environment);
  const token = createAccessTokenCache(() =>
    mintConnectAccessToken({
      connectorUid: connectUid,
      scopes: QUICKBOOKS_CONNECT_SCOPES,
      mintImpl,
    }),
  );

  const headers = async (): Promise<Record<string, string>> => ({
    authorization: `Bearer ${await token()}`,
    accept: "application/json",
  });

  const companyUrl = (path: string, query?: string): string => {
    const suffix = query ? `&${query}` : "";
    return `${origin}/v3/company/${realmId}${path}?minorversion=${QBO_MINOR}${suffix}`;
  };

  return {
    provider: "quickbooks",
    async listOpenInvoices({ max }) {
      const query = `SELECT * FROM Invoice WHERE Balance > '0' MAXRESULTS ${max}`;
      const body = await readOnlyJson<QboQuery>({
        url: companyUrl("/query", `query=${encodeURIComponent(query)}`),
        headers: await headers(),
        fetchImpl,
      });
      return (body.QueryResponse?.Invoice ?? [])
        .map((row) => toInvoice(row))
        .filter((invoice): invoice is OpenInvoice => Boolean(invoice))
        .slice(0, max);
    },
    async getInvoice(id) {
      const body = await readOnlyJson<QboRead>({
        url: companyUrl(`/invoice/${encodeURIComponent(id)}`),
        headers: await headers(),
        fetchImpl,
      });
      return toInvoice(body.Invoice ?? {});
    },
  };
}
