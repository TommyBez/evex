import type { InvoiceChaseConfig } from "../chase-config";
import { parseMoney, withAging, type OpenInvoice } from "../aging";
import { readOnlyJson } from "../http";
import {
  createAccessTokenCache,
  XERO_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { ArClient } from "./types";

const XERO_API = "https://api.xero.com/api.xro/2.0";

type XeroContact = {
  readonly Name?: string;
  readonly EmailAddress?: string;
};
type XeroInvoice = {
  readonly InvoiceID?: string;
  readonly InvoiceNumber?: string;
  readonly AmountDue?: number | string;
  readonly Total?: number | string;
  readonly DueDate?: string;
  readonly Date?: string;
  readonly Status?: string;
  readonly CurrencyCode?: string;
  readonly Contact?: XeroContact;
};
type XeroList = { readonly Invoices?: readonly XeroInvoice[] };

const toInvoice = (
  row: XeroInvoice,
  now = new Date(),
): OpenInvoice | null => {
  if (!row.InvoiceID) {
    return null;
  }
  return withAging(
    {
      id: row.InvoiceID,
      provider: "xero",
      number: row.InvoiceNumber ?? row.InvoiceID,
      customerName: row.Contact?.Name ?? "Customer",
      email: row.Contact?.EmailAddress?.trim() || undefined,
      balance: parseMoney(row.AmountDue),
      total: parseMoney(row.Total),
      dueDate: row.DueDate,
      issuedDate: row.Date,
      currency: row.CurrencyCode,
      status: row.Status,
    },
    now,
  );
};

export function createXeroClient(
  config: InvoiceChaseConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): ArClient {
  const connectUid = config.xero.connectUid ?? "";
  const tenantId = config.xero.tenantId ?? "";
  const token = createAccessTokenCache(() =>
    mintConnectAccessToken({
      connectorUid: connectUid,
      scopes: XERO_CONNECT_SCOPES,
      mintImpl,
    }),
  );

  const headers = async (): Promise<Record<string, string>> => ({
    authorization: `Bearer ${await token()}`,
    accept: "application/json",
    "xero-tenant-id": tenantId,
  });

  return {
    provider: "xero",
    async listOpenInvoices({ max }) {
      const body = await readOnlyJson<XeroList>({
        url: `${XERO_API}/Invoices?Statuses=AUTHORISED&page=1&pageSize=${max}`,
        headers: await headers(),
        fetchImpl,
      });
      return (body.Invoices ?? [])
        .map((row) => toInvoice(row))
        .filter((invoice): invoice is OpenInvoice => Boolean(invoice))
        .slice(0, max);
    },
    async getInvoice(id) {
      const body = await readOnlyJson<XeroList>({
        url: `${XERO_API}/Invoices/${encodeURIComponent(id)}`,
        headers: await headers(),
        fetchImpl,
      });
      return toInvoice(body.Invoices?.[0] ?? {});
    },
  };
}
