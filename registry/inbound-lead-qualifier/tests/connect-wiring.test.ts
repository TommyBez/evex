import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isCrmConfigured,
  isPushConfigured,
  isSlackNotifyConfigured,
  isTypeformConfigured,
  loadInboundLeadConfig,
  missingIntakeEnv,
  resolveCrmProvider,
} from "../agent/lib/lead-config";
import {
  HUBSPOT_CONNECT_SCOPES,
  mintConnectAccessToken,
  TYPEFORM_CONNECT_SCOPES,
} from "../agent/lib/oauth";

const slackChannelSource = readFileSync(
  path.join(import.meta.dirname, "../agent/channels/slack.ts"),
  "utf8",
);
const pushChannelSource = readFileSync(
  path.join(import.meta.dirname, "../agent/channels/lead-push.ts"),
  "utf8",
);
const oauthSource = readFileSync(
  path.join(import.meta.dirname, "../agent/lib/oauth.ts"),
  "utf8",
);

describe("Connect and signed HTTP wiring", () => {
  it("uses Eve-native Slack Connect credentials, not an incoming webhook", () => {
    expect(slackChannelSource).toContain('from "eve/channels/slack"');
    expect(slackChannelSource).toContain('from "@vercel/connect/eve"');
    expect(slackChannelSource).toContain("connectSlackCredentials");
    expect(slackChannelSource).toContain("INBOUND_LEAD_SLACK_CONNECT_UID");
    expect(slackChannelSource).not.toContain("hooks.slack.com");
    expect(slackChannelSource).not.toContain("SLACK_WEBHOOK");
  });

  it("mints app-scoped Connect tokens and does not invent OAuth", () => {
    expect(oauthSource).toContain('from "@vercel/connect"');
    expect(oauthSource).toContain("getTokenResponse");
    expect(oauthSource).toContain('subject: { type: "app" }');
    expect(oauthSource).not.toContain("refresh_token=");
    expect(oauthSource).not.toContain("client_secret");
    expect(HUBSPOT_CONNECT_SCOPES).toContain("crm.objects.contacts.write");
    expect(TYPEFORM_CONNECT_SCOPES).toContain("responses:read");
  });

  it("keeps form intake on signed HTTP, not Slack trigger-forward", () => {
    expect(pushChannelSource).toContain('POST("/leads/push"');
    expect(pushChannelSource).toContain("authorizeLeadPush");
    expect(pushChannelSource).not.toContain("trigger-forward");
    expect(pushChannelSource).not.toContain("hooks.slack.com");
  });

  it("resolves HubSpot from a Connect UID and requires an intake path", () => {
    expect(
      resolveCrmProvider({
        INBOUND_LEAD_HUBSPOT_CONNECT_UID: "hubspot/inbound-lead-qualifier",
      }),
    ).toBe("hubspot");
    expect(isPushConfigured(loadInboundLeadConfig({}))).toBe(false);
    expect(
      isPushConfigured(
        loadInboundLeadConfig({
          INBOUND_LEAD_PUSH_WEBHOOK_SECRET: "secret",
        }),
      ),
    ).toBe(true);
    expect(
      isTypeformConfigured(
        loadInboundLeadConfig({
          INBOUND_LEAD_TYPEFORM_CONNECT_UID: "typeform/inbound-lead-qualifier",
          INBOUND_LEAD_TYPEFORM_FORM_ID: "abc",
        }),
      ),
    ).toBe(true);
    expect(
      isCrmConfigured(
        loadInboundLeadConfig({
          INBOUND_LEAD_HUBSPOT_CONNECT_UID: "hubspot/inbound-lead-qualifier",
        }),
      ),
    ).toBe(true);
    expect(
      isSlackNotifyConfigured(
        loadInboundLeadConfig({
          INBOUND_LEAD_SLACK_CONNECT_UID: "slack/inbound-lead-qualifier",
          INBOUND_LEAD_SLACK_CHANNEL_ID: "C0123456789",
        }),
      ),
    ).toBe(true);
    expect(missingIntakeEnv(loadInboundLeadConfig({}))).toContain(
      "INBOUND_LEAD_PUSH_WEBHOOK_SECRET",
    );
  });

  it("skips an incomplete Salesforce connector when auto-selecting CRM", () => {
    expect(
      resolveCrmProvider({
        INBOUND_LEAD_SALESFORCE_CONNECT_UID:
          "salesforce/inbound-lead-qualifier",
      }),
    ).toBeNull();
    expect(
      resolveCrmProvider({
        INBOUND_LEAD_SALESFORCE_CONNECT_UID:
          "salesforce/inbound-lead-qualifier",
        INBOUND_LEAD_PIPEDRIVE_CONNECT_UID: "pipedrive/inbound-lead-qualifier",
      }),
    ).toBe("pipedrive");
    expect(
      resolveCrmProvider({
        INBOUND_LEAD_HUBSPOT_CONNECT_UID: "hubspot/inbound-lead-qualifier",
        INBOUND_LEAD_SALESFORCE_CONNECT_UID:
          "salesforce/inbound-lead-qualifier",
        INBOUND_LEAD_PIPEDRIVE_CONNECT_UID: "pipedrive/inbound-lead-qualifier",
      }),
    ).toBe("hubspot");
    expect(
      isCrmConfigured(
        loadInboundLeadConfig({
          INBOUND_LEAD_SALESFORCE_CONNECT_UID:
            "salesforce/inbound-lead-qualifier",
          INBOUND_LEAD_PIPEDRIVE_CONNECT_UID:
            "pipedrive/inbound-lead-qualifier",
        }),
      ),
    ).toBe(true);
    expect(
      resolveCrmProvider({
        CRM_PROVIDER: "salesforce",
        INBOUND_LEAD_SALESFORCE_CONNECT_UID:
          "salesforce/inbound-lead-qualifier",
        INBOUND_LEAD_PIPEDRIVE_CONNECT_UID: "pipedrive/inbound-lead-qualifier",
      }),
    ).toBe("salesforce");
  });

  it("mints a Connect token through the injected mint, not a homemade OAuth dance", async () => {
    const minted = await mintConnectAccessToken({
      connectorUid: "hubspot/inbound-lead-qualifier",
      scopes: HUBSPOT_CONNECT_SCOPES,
      mintImpl: async ({ connectorUid, scopes }) => {
        expect(connectorUid).toBe("hubspot/inbound-lead-qualifier");
        expect(scopes).toEqual([...HUBSPOT_CONNECT_SCOPES]);
        return { accessToken: "pat-test", expiresIn: 3600 };
      },
    });
    expect(minted.accessToken).toBe("pat-test");
  });
});
