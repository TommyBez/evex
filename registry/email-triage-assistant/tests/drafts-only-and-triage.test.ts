import { describe, expect, it } from "vitest";

import { replyClaimsDelivery } from "../agent/lib/delivery-claims";
import {
  DEFAULT_TRIAGE_CRON,
  loadEmailTriageConfig,
  missingEmailProviderEnv,
  resolveEmailProvider,
} from "../agent/lib/email-config";
import { parsePushEvent } from "../agent/lib/push-events";
import { createGmailMailbox } from "../agent/lib/providers/gmail";
import { createGraphMailbox } from "../agent/lib/providers/graph";
import { createImapMailbox } from "../agent/lib/providers/imap";
import { ImapClient, type ImapTransport } from "../agent/lib/providers/imap-session";
import {
  assertDraftsOnlyHttp,
  assertDraftsOnlyImap,
  assertNotSendIntent,
  isForbiddenSendUrl,
  isForbiddenSmtpEndpoint,
} from "../agent/lib/send-guard";
import { notifySlackDraftsReady } from "../agent/lib/slack-notify";
import { buildToneProfile } from "../agent/lib/tone-profile";
import {
  DEFAULT_TRIAGE_BUCKETS,
  gmailLabelForBucket,
  imapFolderForBucket,
  isKnownTriageBucket,
  parseTriageBuckets,
} from "../agent/lib/triage-buckets";
import { webhookSecretsMatch } from "../agent/lib/webhook-auth";

function gmailConfig() {
  return loadEmailTriageConfig({
    EMAIL_PROVIDER: "gmail",
    GMAIL_CLIENT_ID: "id",
    GMAIL_CLIENT_SECRET: "secret",
    GMAIL_REFRESH_TOKEN: "refresh",
    GMAIL_USER: "me@example.com",
  });
}

describe("send guard", () => {
  it("refuses Gmail send, Graph sendMail, and SMTP", () => {
    expect(
      isForbiddenSendUrl(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      ),
    ).toBe(true);
    expect(
      isForbiddenSendUrl(
        "https://gmail.googleapis.com/gmail/v1/users/me/drafts/send",
      ),
    ).toBe(true);
    expect(
      isForbiddenSendUrl("https://graph.microsoft.com/v1.0/me/sendMail"),
    ).toBe(true);
    expect(isForbiddenSmtpEndpoint("smtp.example.com", 587)).toBe(true);
    expect(isForbiddenSmtpEndpoint("imap.example.com", 993)).toBe(false);
    expect(() =>
      assertDraftsOnlyHttp(
        "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
        "POST",
      ),
    ).not.toThrow();
    expect(() =>
      assertDraftsOnlyHttp(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        "POST",
      ),
    ).toThrow(/never sends mail/);
    expect(() => assertDraftsOnlyImap("smtp.gmail.com", 465)).toThrow(/SMTP/);
    expect(() => assertNotSendIntent("send")).toThrow(/Drafts/);
    expect(() => assertNotSendIntent("draft")).not.toThrow();
  });
});

describe("triage buckets", () => {
  it("defaults and validates configured slugs", () => {
    expect(parseTriageBuckets(undefined)).toEqual([...DEFAULT_TRIAGE_BUCKETS]);
    expect(parseTriageBuckets("Needs-Reply, FYI, needs-reply")).toEqual([
      "needs-reply",
      "fyi",
    ]);
    expect(isKnownTriageBucket("needs-reply", DEFAULT_TRIAGE_BUCKETS)).toBe(
      true,
    );
    expect(isKnownTriageBucket("unknown", DEFAULT_TRIAGE_BUCKETS)).toBe(false);
    expect(gmailLabelForBucket("needs-reply")).toBe("triage/needs-reply");
    expect(imapFolderForBucket("fyi")).toBe("Triage/fyi");
  });
});

describe("schedule and provider config", () => {
  it("defaults the cron and resolves the first complete provider", () => {
    const empty = loadEmailTriageConfig({});
    expect(empty.cron).toBe(DEFAULT_TRIAGE_CRON);
    expect(empty.provider).toBeNull();
    expect(missingEmailProviderEnv(empty)).toEqual(["EMAIL_PROVIDER"]);

    expect(
      resolveEmailProvider({
        GMAIL_CLIENT_ID: "id",
        GMAIL_REFRESH_TOKEN: "refresh",
      }),
    ).toBe("gmail");
    expect(
      resolveEmailProvider({
        EMAIL_PROVIDER: "imap",
        IMAP_HOST: "imap.example.com",
        IMAP_USER: "me",
      }),
    ).toBe("imap");
  });
});

describe("Gmail drafts.create never hits send", () => {
  it("refreshes OAuth, lists inbox, and POSTs /drafts only", async () => {
    const urls: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      urls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.includes("oauth2.googleapis.com/token")) {
        return Response.json({ access_token: "ya29.token" });
      }
      if (url.includes("/threads?") && url.includes("inbox")) {
        return Response.json({ threads: [{ id: "t1" }] });
      }
      if (url.includes("/threads/t1")) {
        return Response.json({
          id: "t1",
          snippet: "Can we get a refund?",
          messages: [
            {
              id: "m1",
              snippet: "Can we get a refund?",
              labelIds: ["INBOX"],
              payload: {
                headers: [
                  { name: "Subject", value: "Refund" },
                  { name: "From", value: "ava@example.com" },
                ],
              },
            },
          ],
        });
      }
      if (url.endsWith("/drafts")) {
        return Response.json({ id: "d1" });
      }
      throw new Error(`unexpected ${url}`);
    };

    const mailbox = createGmailMailbox(gmailConfig(), fetchImpl);
    const threads = await mailbox.listThreads({ max: 5 });
    expect(threads[0]?.id).toBe("t1");
    const draft = await mailbox.createDraftReply({
      threadId: "t1",
      to: "ava@example.com",
      subject: "Re: Refund",
      body: "Hi Ava — I will check the annual-plan refund window and follow up.",
    });
    expect(draft.sent).toBe(false);
    expect(draft.mailbox).toBe("Drafts");
    expect(urls.some((url) => url.includes("/messages/send"))).toBe(false);
    expect(urls.some((url) => url.includes("/drafts/send"))).toBe(false);
    expect(urls.some((url) => url.includes("POST ") && url.endsWith("/drafts"))).toBe(
      true,
    );
  });
});

describe("Graph createReply never sendMail", () => {
  it("creates a draft reply and patches it", async () => {
    const urls: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      urls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.includes("/oauth2/v2.0/token")) {
        return Response.json({ access_token: "eyJ" });
      }
      if (url.includes("/messages?") || url.includes("/mailFolders/inbox")) {
        return Response.json({
          value: [
            {
              id: "m1",
              conversationId: "c1",
              subject: "Refund",
              bodyPreview: "Can we get a refund?",
              from: { emailAddress: { address: "ava@example.com" } },
            },
          ],
        });
      }
      if (url.includes("/createReply")) {
        return Response.json({ id: "draft-1" });
      }
      if (url.includes("/messages/draft-1")) {
        return Response.json({ id: "draft-1" });
      }
      throw new Error(`unexpected ${url}`);
    };

    const mailbox = createGraphMailbox(
      loadEmailTriageConfig({
        EMAIL_PROVIDER: "outlook",
        MICROSOFT_CLIENT_ID: "id",
        MICROSOFT_CLIENT_SECRET: "secret",
        MICROSOFT_TENANT_ID: "tenant",
        MICROSOFT_REFRESH_TOKEN: "refresh",
      }),
      fetchImpl,
    );
    const draft = await mailbox.createDraftReply({
      threadId: "c1",
      to: "ava@example.com",
      subject: "Re: Refund",
      body: "Hi Ava — I will check the annual-plan refund window and follow up.",
    });
    expect(draft.sent).toBe(false);
    expect(urls.some((url) => url.toLowerCase().includes("sendmail"))).toBe(
      false,
    );
    expect(urls.some((url) => url.includes("/createReply"))).toBe(true);
  });
});

describe("IMAP APPEND to Drafts", () => {
  it("appends a Drafts literal and never talks SMTP", async () => {
    const writes: string[] = [];
    const script = [
      "* OK IMAP ready\r\n",
      "A1 OK LOGIN\r\n",
      "A2 OK SELECT\r\n",
      "+ ready\r\n",
      "A3 OK [APPENDUID 1 99] APPEND\r\n",
      "* BYE\r\nA4 OK LOGOUT\r\n",
    ];
    let cursor = 0;
    let pending = "";

    const transport: ImapTransport = {
      async write(chunk) {
        writes.push(chunk);
        if (chunk.startsWith("A3 APPEND")) {
          pending += script[cursor] ?? "";
          cursor += 1;
        }
      },
      async readUntil(predicate) {
        if (!pending) {
          pending = script[cursor] ?? "";
          cursor += 1;
        }
        if (!predicate(pending)) {
          throw new Error(`IMAP fixture did not satisfy read: ${pending}`);
        }
        const snapshot = pending;
        pending = "";
        return snapshot;
      },
      async close() {},
    };

    const mailbox = createImapMailbox(
      loadEmailTriageConfig({
        EMAIL_PROVIDER: "imap",
        IMAP_HOST: "imap.example.com",
        IMAP_PORT: "993",
        IMAP_USER: "me",
        IMAP_PASSWORD: "pw",
        IMAP_DRAFTS_MAILBOX: "Drafts",
      }),
      async () => transport,
    );

    const draft = await mailbox.createDraftReply({
      threadId: "12",
      to: "ava@example.com",
      subject: "Re: Refund",
      body: "Hi Ava — I will check the annual-plan refund window and follow up.",
    });
    expect(draft.sent).toBe(false);
    expect(draft.mailbox).toBe("Drafts");
    expect(writes.some((chunk) => chunk.includes("APPEND \"Drafts\""))).toBe(
      true,
    );
    expect(writes.some((chunk) => /SMTP|MAIL FROM/i.test(chunk))).toBe(false);
  });

  it("parses UID SEARCH from a scripted session", async () => {
    const script = [
      "* OK IMAP ready\r\n",
      "A1 OK LOGIN\r\n",
      "* SEARCH 10 11 12\r\nA2 OK SEARCH\r\n",
    ];
    let cursor = 0;
    const transport: ImapTransport = {
      async write() {},
      async readUntil() {
        const snapshot = script[cursor] ?? "";
        cursor += 1;
        return snapshot;
      },
      async close() {},
    };
    const client = new ImapClient(transport);
    await client.connectGreeting();
    await client.login("me", "pw");
    expect(await client.searchAll()).toEqual([10, 11, 12]);
  });
});

describe("tone profile", () => {
  it("extracts greeting and sign-off from sent mail", () => {
    const profile = buildToneProfile([
      {
        subject: "Re: Refund",
        body: "Hi Ava,\n\nI can confirm the 14-day window.\n\nThanks,\nSam",
      },
      {
        subject: "Re: Access",
        body: "Hi team,\n\nWe reset the key this morning.\n\nThanks,\nSam",
      },
    ]);
    expect(profile.sampleCount).toBe(2);
    expect(profile.greeting?.toLowerCase()).toContain("hi");
    expect(profile.signOff?.toLowerCase()).toContain("thanks");
    expect(profile.brief).toContain("Match the sent-folder voice");
  });
});

describe("push and Slack", () => {
  it("parses Gmail, Graph, and generic push payloads", () => {
    expect(
      parsePushEvent({
        searchParams: new URLSearchParams("validationToken=abc"),
      }),
    ).toEqual({ validationToken: "abc" });
    expect(
      parsePushEvent({
        body: { message: { data: "e30=" }, subscription: "projects/x" },
      }),
    ).toMatchObject({ source: "gmail", reason: "push" });
    expect(
      parsePushEvent({ body: { subscriptionId: "sub-1" } }),
    ).toMatchObject({ source: "outlook", reason: "push" });
    expect(parsePushEvent({ body: { reason: "push" } })).toMatchObject({
      source: "generic",
      reason: "push",
    });
  });

  it("posts a drafts-ready Slack note without claiming email send", async () => {
    const result = await notifySlackDraftsReady({
      webhookUrl: "https://hooks.slack.com/services/test",
      draftCount: 2,
      buckets: ["needs-reply"],
      fetchImpl: async () => new Response("ok"),
    });
    expect(result).toEqual({ notified: true, sent: false });
  });

  it("rejects a mismatched push secret", () => {
    expect(webhookSecretsMatch("nope", "secret")).toBe(false);
    expect(webhookSecretsMatch("secret", "secret")).toBe(true);
    expect(webhookSecretsMatch(null, "secret")).toBe(false);
  });
});

describe("replyClaimsDelivery", () => {
  it("treats send claims as delivery and ignores negated drafts", () => {
    expect(replyClaimsDelivery("Done — I sent the email.")).toBe(true);
    expect(replyClaimsDelivery("I drafted the reply and did not send it.")).toBe(
      false,
    );
  });
});
