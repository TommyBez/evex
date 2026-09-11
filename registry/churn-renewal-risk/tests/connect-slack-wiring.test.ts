import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  HUBSPOT_CONNECT_SCOPES,
  mintConnectAccessToken,
  STRIPE_CONNECT_SCOPES,
} from "../agent/lib/oauth";
import {
  isSlackDeliveryConfigured,
  loadChurnRenewalConfig,
  missingCrmProviderEnv,
  resolveCrmProvider,
} from "../agent/lib/renewal-config";
import { createHubSpotClient } from "../agent/lib/providers/hubspot";
import { createSalesforceClient } from "../agent/lib/providers/salesforce";
import { postSlackDigest } from "../agent/lib/slack-post";

const slackChannelSource = readFileSync(
  path.join(import.meta.dirname, "../agent/channels/slack.ts"),
  "utf8",
);
const oauthSource = readFileSync(
  path.join(import.meta.dirname, "../agent/lib/oauth.ts"),
  "utf8",
);

describe("Connect and Slack wiring", () => {
  it("uses Eve-native Slack Connect credentials, not an incoming webhook", () => {
    expect(slackChannelSource).toContain('from "eve/channels/slack"');
    expect(slackChannelSource).toContain('from "@vercel/connect/eve"');
    expect(slackChannelSource).toContain("connectSlackCredentials");
    expect(slackChannelSource).toContain("CHURN_RENEWAL_SLACK_CONNECT_UID");
    expect(slackChannelSource).not.toContain("hooks.slack.com");
    expect(slackChannelSource).not.toContain("SLACK_WEBHOOK");
  });

  it("mints app-scoped Connect tokens and does not invent OAuth", () => {
    expect(oauthSource).toContain('from "@vercel/connect"');
    expect(oauthSource).toContain("getTokenResponse");
    expect(oauthSource).toContain('subject: { type: "app" }');
    expect(oauthSource).not.toContain("refresh_token=");
    expect(oauthSource).not.toContain("client_secret");
    expect(HUBSPOT_CONNECT_SCOPES).toContain("crm.objects.companies.read");
    expect(STRIPE_CONNECT_SCOPES).toContain("read_only");
  });

  it("treats Slack as unset unless Connect UID and channel id are both set", () => {
    expect(isSlackDeliveryConfigured(loadChurnRenewalConfig({}))).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadChurnRenewalConfig({
          CHURN_RENEWAL_SLACK_CONNECT_UID: "slack/churn-renewal-risk",
        }),
      ),
    ).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadChurnRenewalConfig({
          CHURN_RENEWAL_SLACK_CONNECT_UID: "slack/churn-renewal-risk",
          CHURN_RENEWAL_SLACK_CHANNEL_ID: "C0123456789",
        }),
      ),
    ).toBe(true);
  });

  it("resolves HubSpot or Salesforce from Connect UIDs", () => {
    expect(
      resolveCrmProvider({
        CHURN_RENEWAL_HUBSPOT_CONNECT_UID: "hubspot/churn-renewal-risk",
      }),
    ).toBe("hubspot");
    expect(
      resolveCrmProvider({
        CHURN_RENEWAL_SALESFORCE_CONNECT_UID: "salesforce/churn-renewal-risk",
      }),
    ).toBe("salesforce");
    expect(
      missingCrmProviderEnv(
        loadChurnRenewalConfig({ CRM_PROVIDER: "salesforce" }),
      ),
    ).toEqual([
      "CHURN_RENEWAL_SALESFORCE_CONNECT_UID",
      "CHURN_RENEWAL_SALESFORCE_INSTANCE_URL",
    ]);
  });

  it("lists HubSpot companies with a Connect token and never mutates", async () => {
    const urls: string[] = [];
    let mintedUid = "";
    const client = createHubSpotClient(
      loadChurnRenewalConfig({
        CRM_PROVIDER: "hubspot",
        CHURN_RENEWAL_HUBSPOT_CONNECT_UID: "hubspot/churn-renewal-risk",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          results: [
            {
              id: "1",
              properties: {
                name: "Acme",
                renewal_date: "2026-10-01",
                stripe_customer_id: "cus_123",
              },
            },
          ],
        });
      },
      async (input) => {
        mintedUid = input.connectorUid;
        return { accessToken: "hs-token", expiresIn: 3600 };
      },
    );
    const accounts = await client.listRenewalAccounts({
      lookaheadDays: 90,
      max: 20,
      now: new Date("2026-09-11T08:00:00.000Z"),
    });
    expect(accounts[0]).toMatchObject({
      id: "1",
      name: "Acme",
      stripeCustomerId: "cus_123",
    });
    expect(mintedUid).toBe("hubspot/churn-renewal-risk");
    expect(urls.some((url) => url.includes("/companies/search"))).toBe(true);
    expect(urls.some((url) => /PATCH|PUT|DELETE/.test(url))).toBe(false);
  });

  it("lists Salesforce accounts as GET-only", async () => {
    const urls: string[] = [];
    const client = createSalesforceClient(
      loadChurnRenewalConfig({
        CRM_PROVIDER: "salesforce",
        CHURN_RENEWAL_SALESFORCE_CONNECT_UID: "salesforce/churn-renewal-risk",
        CHURN_RENEWAL_SALESFORCE_INSTANCE_URL: "https://example.my.salesforce.com",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          records: [
            {
              Id: "001",
              Name: "Acme",
              Renewal_Date__c: "2026-10-01",
              Stripe_Customer_Id__c: "cus_123",
            },
          ],
        });
      },
      async () => ({ accessToken: "sf-token", expiresIn: 3600 }),
    );
    expect(
      await client.listRenewalAccounts({
        lookaheadDays: 90,
        max: 10,
        now: new Date("2026-09-11T08:00:00.000Z"),
      }),
    ).toMatchObject([{ id: "001", name: "Acme", stripeCustomerId: "cus_123" }]);
    expect(urls.every((url) => url.startsWith("GET"))).toBe(true);
  });

  it("exports a Slack Connect poster, not a webhook URL builder", () => {
    expect(postSlackDigest).toBeTypeOf("function");
    expect(String(postSlackDigest)).toContain("connectUid");
  });

  it("mints a Connect access token through the injected helper", async () => {
    const token = await mintConnectAccessToken({
      connectorUid: "stripe/churn-renewal-risk",
      scopes: STRIPE_CONNECT_SCOPES,
      mintImpl: async (input) => {
        expect(input.connectorUid).toBe("stripe/churn-renewal-risk");
        expect(input.scopes).toEqual([...STRIPE_CONNECT_SCOPES]);
        return { accessToken: "stripe-token", expiresIn: 3600 };
      },
    });
    expect(token).toEqual({ accessToken: "stripe-token", expiresIn: 3600 });
  });
});
