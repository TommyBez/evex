import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isDriveConfigured,
  isSlackConfigured,
  loadRfpResponseConfig,
  resolveMailboxProvider,
  resolveWritebackTarget,
} from "../agent/lib/rfp-config";
import {
  DRIVE_READ_SCOPES,
  GMAIL_CONNECT_SCOPES,
  MICROSOFT_CONNECT_SCOPES,
  mintConnectAccessToken,
  scopesForDriveRead,
  scopesForMailboxProvider,
} from "../agent/lib/oauth";
import { createDriveClient } from "../agent/lib/providers/drive";
import { postSlackMessage } from "../agent/lib/slack-post";

const slackChannelSource = readFileSync(
  path.join(import.meta.dirname, "../agent/channels/slack.ts"),
  "utf8",
);

describe("Connect and Slack wiring", () => {
  it("uses Eve-native Slack Connect credentials, not an incoming webhook", () => {
    expect(slackChannelSource).toContain('from "eve/channels/slack"');
    expect(slackChannelSource).toContain('from "@vercel/connect/eve"');
    expect(slackChannelSource).toContain("connectSlackCredentials");
    expect(slackChannelSource).toContain("RFP_RESPONSE_SLACK_CONNECT_UID");
    expect(slackChannelSource).not.toContain("hooks.slack.com");
    expect(slackChannelSource).not.toContain("SLACK_WEBHOOK");
  });

  it("treats Slack as unset unless Connect UID and channel id are both set", () => {
    expect(isSlackConfigured(loadRfpResponseConfig({}))).toBe(false);
    expect(
      isSlackConfigured(
        loadRfpResponseConfig({
          RFP_RESPONSE_SLACK_CONNECT_UID: "slack/rfp-response-drafter",
        }),
      ),
    ).toBe(false);
    expect(
      isSlackConfigured(
        loadRfpResponseConfig({
          RFP_RESPONSE_SLACK_CONNECT_UID: "slack/rfp-response-drafter",
          RFP_RESPONSE_SLACK_CHANNEL_ID: "C0123456789",
        }),
      ),
    ).toBe(true);
  });

  it("resolves Drive read and mailbox Drafts from Google or Microsoft Connect", () => {
    const driveOnly = loadRfpResponseConfig({
      RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
    });
    expect(isDriveConfigured(driveOnly)).toBe(true);
    expect(driveOnly.writeback).toBe("drive");
    expect(
      resolveWritebackTarget({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
      }),
    ).toBe("drive");
    expect(
      resolveMailboxProvider({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
      }),
    ).toBe("gmail");
    expect(scopesForDriveRead()).toEqual([...DRIVE_READ_SCOPES]);
    expect(scopesForMailboxProvider("gmail")).toEqual([...GMAIL_CONNECT_SCOPES]);
    expect(scopesForMailboxProvider("outlook")).toEqual([
      ...MICROSOFT_CONNECT_SCOPES,
    ]);
    expect(
      resolveWritebackTarget({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
        RFP_RESPONSE_DRAFT_TO: "sme@example.com",
      }),
    ).toBe("both");
  });

  it("mints a Connect access token through the injected helper", async () => {
    const token = await mintConnectAccessToken({
      connectorUid: "google/rfp-response-drafter",
      scopes: DRIVE_READ_SCOPES,
      mintImpl: async (input) => {
        expect(input.connectorUid).toBe("google/rfp-response-drafter");
        expect(input.scopes).toEqual([...DRIVE_READ_SCOPES]);
        return { accessToken: "drive-token", expiresIn: 3600 };
      },
    });
    expect(token).toEqual({ accessToken: "drive-token", expiresIn: 3600 });
  });

  it("lists Drive files as GET-only", async () => {
    const urls: string[] = [];
    const client = createDriveClient(
      loadRfpResponseConfig({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
        RFP_RESPONSE_DRIVE_FOLDER_ID: "folder-1",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({
          files: [{ id: "file-1", name: "rfp.md", mimeType: "text/markdown" }],
        });
      },
      async () => ({ accessToken: "drive-token", expiresIn: 3600 }),
    );
    expect(await client.listFiles({})).toMatchObject([
      { id: "file-1", name: "rfp.md" },
    ]);
    expect(urls.every((url) => url.startsWith("GET"))).toBe(true);
    expect(urls[0]).toContain("www.googleapis.com/drive/v3/files");
  });

  it("exports a Slack Connect poster, not a webhook URL builder", () => {
    expect(postSlackMessage).toBeTypeOf("function");
    expect(String(postSlackMessage)).toContain("connectUid");
  });
});
