import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isSlackDeliveryConfigured,
  loadInvoiceChaseConfig,
  missingArProviderEnv,
  resolveArProvider,
  resolveMailboxProvider,
} from "../agent/lib/chase-config";
import {
  GMAIL_CONNECT_SCOPES,
  MICROSOFT_CONNECT_SCOPES,
  mintConnectAccessToken,
  QUICKBOOKS_CONNECT_SCOPES,
  scopesForArProvider,
  scopesForMailboxProvider,
  XERO_CONNECT_SCOPES,
} from "../agent/lib/oauth";
import { createQuickBooksClient } from "../agent/lib/providers/quickbooks";
import { createXeroClient } from "../agent/lib/providers/xero";
import { postSlackDigest } from "../agent/lib/slack-post";

const slackChannelSource = readFileSync(
  path.join(import.meta.dirname, "../agent/channels/slack.ts"),
  "utf8",
);

describe("Connect and Slack wiring", () => {
  it("uses Eve-native Slack Connect credentials, not an incoming webhook", () => {
    expect(slackChannelSource).toContain('from "eve/channels/slack"');
    expect(slackChannelSource).toContain('from "@vercel/connect/eve"');
    expect(slackChannelSource).toContain("connectSlackCredentials");
    expect(slackChannelSource).toContain("INVOICE_CHASE_SLACK_CONNECT_UID");
    expect(slackChannelSource).not.toContain("hooks.slack.com");
    expect(slackChannelSource).not.toContain("SLACK_WEBHOOK");
  });

  it("treats Slack as unset unless Connect UID and channel id are both set", () => {
    expect(isSlackDeliveryConfigured(loadInvoiceChaseConfig({}))).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadInvoiceChaseConfig({
          INVOICE_CHASE_SLACK_CONNECT_UID: "slack/invoice-chase-drafter",
        }),
      ),
    ).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadInvoiceChaseConfig({
          INVOICE_CHASE_SLACK_CONNECT_UID: "slack/invoice-chase-drafter",
          INVOICE_CHASE_SLACK_CHANNEL_ID: "C0123456789",
        }),
      ),
    ).toBe(true);
  });

  it("resolves QuickBooks or Xero from Custom OAuth Connect UIDs", () => {
    expect(
      resolveArProvider({
        INVOICE_CHASE_QUICKBOOKS_CONNECT_UID: "custom/quickbooks",
      }),
    ).toBe("quickbooks");
    expect(
      resolveArProvider({
        INVOICE_CHASE_XERO_CONNECT_UID: "custom/xero",
      }),
    ).toBe("xero");
    expect(scopesForArProvider("quickbooks")).toEqual([
      ...QUICKBOOKS_CONNECT_SCOPES,
    ]);
    expect(scopesForArProvider("xero")).toEqual([...XERO_CONNECT_SCOPES]);
    expect(
      missingArProviderEnv(
        loadInvoiceChaseConfig({ INVOICE_CHASE_AR_PROVIDER: "quickbooks" }),
      ),
    ).toEqual([
      "INVOICE_CHASE_QUICKBOOKS_CONNECT_UID",
      "INVOICE_CHASE_QUICKBOOKS_REALM_ID",
    ]);
    expect(
      resolveMailboxProvider({
        INVOICE_CHASE_GOOGLE_CONNECT_UID: "google/invoice-chase-drafter",
      }),
    ).toBe("gmail");
    expect(scopesForMailboxProvider("gmail")).toEqual([...GMAIL_CONNECT_SCOPES]);
    expect(scopesForMailboxProvider("outlook")).toEqual([
      ...MICROSOFT_CONNECT_SCOPES,
    ]);
  });

  it("mints a Connect access token through the injected helper", async () => {
    const token = await mintConnectAccessToken({
      connectorUid: "custom/quickbooks",
      scopes: QUICKBOOKS_CONNECT_SCOPES,
      mintImpl: async (input) => {
        expect(input.connectorUid).toBe("custom/quickbooks");
        expect(input.scopes).toEqual([...QUICKBOOKS_CONNECT_SCOPES]);
        return { accessToken: "qbo-token", expiresIn: 3600 };
      },
    });
    expect(token).toEqual({ accessToken: "qbo-token", expiresIn: 3600 });
  });

  it("lists QuickBooks invoices with a Connect token and never mutates", async () => {
    const urls: string[] = [];
    let mintedUid = "";
    const client = createQuickBooksClient(
      loadInvoiceChaseConfig({
        INVOICE_CHASE_AR_PROVIDER: "quickbooks",
        INVOICE_CHASE_QUICKBOOKS_CONNECT_UID: "custom/quickbooks",
        INVOICE_CHASE_QUICKBOOKS_REALM_ID: "123",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          QueryResponse: {
            Invoice: [
              {
                Id: "1",
                DocNumber: "1042",
                Balance: 240,
                TotalAmt: 240,
                DueDate: "2026-08-01",
                CustomerRef: { name: "Ava" },
                BillEmail: { Address: "ava@example.com" },
              },
            ],
          },
        });
      },
      async (input) => {
        mintedUid = input.connectorUid;
        return { accessToken: "qbo-token", expiresIn: 3600 };
      },
    );
    const invoices = await client.listOpenInvoices({ max: 20 });
    expect(invoices[0]).toMatchObject({
      id: "1",
      number: "1042",
      email: "ava@example.com",
      provider: "quickbooks",
    });
    expect(mintedUid).toBe("custom/quickbooks");
    expect(urls.every((url) => url.startsWith("GET"))).toBe(true);
    expect(urls.some((url) => /POST|PATCH|PUT|DELETE/.test(url))).toBe(false);
  });

  it("lists Xero invoices as GET-only", async () => {
    const urls: string[] = [];
    const client = createXeroClient(
      loadInvoiceChaseConfig({
        INVOICE_CHASE_AR_PROVIDER: "xero",
        INVOICE_CHASE_XERO_CONNECT_UID: "custom/xero",
        INVOICE_CHASE_XERO_TENANT_ID: "tenant-1",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          Invoices: [
            {
              InvoiceID: "x1",
              InvoiceNumber: "INV-9",
              AmountDue: 80,
              Total: 80,
              DueDate: "2026-07-01",
              Status: "AUTHORISED",
              Contact: { Name: "Sam", EmailAddress: "sam@example.com" },
            },
          ],
        });
      },
      async () => ({ accessToken: "xero-token", expiresIn: 3600 }),
    );
    expect(await client.listOpenInvoices({ max: 10 })).toMatchObject([
      { id: "x1", email: "sam@example.com", provider: "xero" },
    ]);
    expect(urls.every((url) => url.startsWith("GET"))).toBe(true);
  });

  it("exports a Slack Connect poster, not a webhook URL builder", () => {
    expect(postSlackDigest).toBeTypeOf("function");
    expect(String(postSlackDigest)).toContain("connectUid");
  });
});
