import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  HUBSPOT_CONNECT_SCOPES,
  mintConnectAccessToken,
  PIPEDRIVE_CONNECT_SCOPES,
  SALESFORCE_CONNECT_SCOPES,
  scopesForProvider,
} from "../agent/lib/oauth";
import {
  isSlackDeliveryConfigured,
  loadCrmHygieneConfig,
  missingCrmProviderEnv,
  resolveCrmProvider,
} from "../agent/lib/crm-config";
import { createHubSpotClient } from "../agent/lib/providers/hubspot";
import { createPipedriveClient } from "../agent/lib/providers/pipedrive";
import { createSalesforceClient } from "../agent/lib/providers/salesforce";
import { postSlackDigest } from "../agent/lib/slack-post";

const slackChannelSource = readFileSync(
  path.join(import.meta.dirname, "../agent/channels/slack.ts"),
  "utf8",
);

describe("Connect and Slack wiring", () => {
  it("uses Eve-native Slack Connect credentials, not an incoming webhook", () => {
    expect(slackChannelSource).toContain('from "eve/channels/slack"');
    expect(slackChannelSource).toContain(
      'from "@vercel/connect/eve"',
    );
    expect(slackChannelSource).toContain("connectSlackCredentials");
    expect(slackChannelSource).toContain("CRM_HYGIENE_SLACK_CONNECT_UID");
    expect(slackChannelSource).not.toContain("hooks.slack.com");
    expect(slackChannelSource).not.toContain("SLACK_WEBHOOK");
  });

  it("treats Slack as unset unless Connect UID and channel id are both set", () => {
    expect(isSlackDeliveryConfigured(loadCrmHygieneConfig({}))).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadCrmHygieneConfig({
          CRM_HYGIENE_SLACK_CONNECT_UID: "slack/crm-hygiene-agent",
        }),
      ),
    ).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadCrmHygieneConfig({
          CRM_HYGIENE_SLACK_CHANNEL_ID: "C0123456789",
        }),
      ),
    ).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadCrmHygieneConfig({
          CRM_HYGIENE_SLACK_CONNECT_UID: "slack/crm-hygiene-agent",
          CRM_HYGIENE_SLACK_CHANNEL_ID: "C0123456789",
        }),
      ),
    ).toBe(true);
  });

  it("resolves HubSpot, Salesforce, or Pipedrive from Connect UIDs", () => {
    expect(
      resolveCrmProvider({
        CRM_HYGIENE_HUBSPOT_CONNECT_UID: "hubspot/crm-hygiene-agent",
      }),
    ).toBe("hubspot");
    expect(
      resolveCrmProvider({
        CRM_HYGIENE_SALESFORCE_CONNECT_UID: "salesforce/crm-hygiene-agent",
      }),
    ).toBe("salesforce");
    expect(
      resolveCrmProvider({
        CRM_HYGIENE_PIPEDRIVE_CONNECT_UID: "pipedrive/crm-hygiene-agent",
      }),
    ).toBe("pipedrive");
    expect(scopesForProvider("hubspot")).toEqual([...HUBSPOT_CONNECT_SCOPES]);
    expect(scopesForProvider("salesforce")).toEqual([
      ...SALESFORCE_CONNECT_SCOPES,
    ]);
    expect(scopesForProvider("pipedrive")).toEqual([
      ...PIPEDRIVE_CONNECT_SCOPES,
    ]);
    expect(
      missingCrmProviderEnv(
        loadCrmHygieneConfig({ CRM_PROVIDER: "hubspot" }),
      ),
    ).toEqual(["CRM_HYGIENE_HUBSPOT_CONNECT_UID"]);
  });

  it("mints a Connect access token through the injected helper", async () => {
    const token = await mintConnectAccessToken({
      connectorUid: "hubspot/crm-hygiene-agent",
      scopes: HUBSPOT_CONNECT_SCOPES,
      mintImpl: async (input) => {
        expect(input.connectorUid).toBe("hubspot/crm-hygiene-agent");
        expect(input.scopes).toEqual([...HUBSPOT_CONNECT_SCOPES]);
        return { accessToken: "pat-test", expiresIn: 3600 };
      },
    });
    expect(token).toEqual({ accessToken: "pat-test", expiresIn: 3600 });
  });

  it("lists HubSpot contacts with a Connect token and never mutates", async () => {
    const urls: string[] = [];
    let mintedUid = "";
    const client = createHubSpotClient(
      loadCrmHygieneConfig({
        CRM_PROVIDER: "hubspot",
        CRM_HYGIENE_HUBSPOT_CONNECT_UID: "hubspot/crm-hygiene-agent",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          results: [
            {
              id: "1",
              properties: { email: "ava@example.com", firstname: "Ava" },
            },
          ],
        });
      },
      async (input) => {
        mintedUid = input.connectorUid;
        return { accessToken: "pat-test", expiresIn: 3600 };
      },
    );
    const records = await client.listRecords({ max: 20 });
    expect(records).toEqual([
      {
        id: "1",
        email: "ava@example.com",
        firstName: "Ava",
        lastName: undefined,
        phone: undefined,
        company: undefined,
        website: undefined,
      },
    ]);
    expect(mintedUid).toBe("hubspot/crm-hygiene-agent");
    expect(urls.every((url) => url.startsWith("GET"))).toBe(true);
    expect(urls.some((url) => /POST|PATCH|PUT|DELETE/.test(url))).toBe(false);
  });

  it("lists Salesforce and Pipedrive contacts as GET-only", async () => {
    const salesforceUrls: string[] = [];
    const salesforce = createSalesforceClient(
      loadCrmHygieneConfig({
        CRM_PROVIDER: "salesforce",
        CRM_HYGIENE_SALESFORCE_CONNECT_UID: "salesforce/crm-hygiene-agent",
        CRM_HYGIENE_SALESFORCE_INSTANCE_URL: "https://example.my.salesforce.com",
      }),
      async (input, init) => {
        salesforceUrls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          records: [{ Id: "003xx", Email: "ava@example.com", FirstName: "Ava" }],
        });
      },
      async () => ({ accessToken: "sf-token", expiresIn: 3600 }),
    );
    expect(await salesforce.listRecords({ max: 10 })).toMatchObject([
      { id: "003xx", email: "ava@example.com" },
    ]);
    expect(salesforceUrls.every((url) => url.startsWith("GET"))).toBe(true);

    const pipedriveUrls: string[] = [];
    const pipedrive = createPipedriveClient(
      loadCrmHygieneConfig({
        CRM_PROVIDER: "pipedrive",
        CRM_HYGIENE_PIPEDRIVE_CONNECT_UID: "pipedrive/crm-hygiene-agent",
      }),
      async (input, init) => {
        pipedriveUrls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          data: [{ id: 9, name: "Ava Nguyen", email: [{ value: "ava@example.com" }] }],
        });
      },
      async () => ({ accessToken: "pd-token", expiresIn: 3600 }),
    );
    expect(await pipedrive.listRecords({ max: 10 })).toMatchObject([
      { id: "9", email: "ava@example.com", firstName: "Ava" },
    ]);
    expect(pipedriveUrls.every((url) => url.startsWith("GET"))).toBe(true);
  });

  it("exports a Slack Connect poster, not a webhook URL builder", () => {
    expect(postSlackDigest).toBeTypeOf("function");
    expect(String(postSlackDigest)).toContain("connectUid");
  });
});
