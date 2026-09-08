import type { EmailTriageConfig } from "../email-config";
import { parseMimeMessage } from "../mime";
import { buildRfc822 } from "../rfc822";
import { assertDraftsOnlyImap } from "../send-guard";
import { hasTriageMarker, imapFolderForBucket } from "../triage-buckets";
import type { ToneSample } from "../tone-profile";
import {
  createTlsImapConnect,
  ImapClient,
  type ImapConnect,
} from "./imap-session";
import type {
  BucketApplyResult,
  DraftReplyInput,
  DraftReplyResult,
  EmailMailbox,
  InboxThread,
  ThreadDetail,
} from "./types";

export function createImapMailbox(
  config: EmailTriageConfig,
  connect: ImapConnect = createTlsImapConnect(),
): EmailMailbox {
  const host = config.imap.host ?? "";
  const port = config.imap.port;
  assertDraftsOnlyImap(host, port);

  const open = async (mailbox: string): Promise<ImapClient> => {
    const user = config.imap.user;
    const password = config.imap.password;
    if (!(user && password)) {
      throw new Error("IMAP credentials are not configured.");
    }
    const transport = await connect({ host, port });
    const client = new ImapClient(transport);
    await client.connectGreeting();
    await client.login(user, password);
    await client.select(mailbox);
    return client;
  };

  return {
    provider: "imap",
    async listThreads({ max }) {
      const client = await open(config.imap.inboxMailbox);
      try {
        const uids = (await client.searchAll()).slice(-max);
        const threads: InboxThread[] = [];
        for (const uid of uids) {
          const fetched = await client.fetchRfc822AndFlags(uid);
          if (hasTriageMarker(fetched.flags)) {
            continue;
          }
          const parsed = parseMimeMessage(fetched.rfc822);
          threads.push({
            id: String(uid),
            provider: "imap",
            subject: parsed.subject || "(no subject)",
            from: parsed.from,
            snippet: parsed.body.slice(0, 240),
            labels: [...fetched.flags],
            receivedAt: parsed.date,
          });
        }
        return threads;
      } finally {
        await client.logout();
      }
    },
    async readThread(threadId) {
      const client = await open(config.imap.inboxMailbox);
      try {
        const rfc822 = await client.fetchRfc822(Number(threadId));
        const parsed = parseMimeMessage(rfc822);
        return {
          id: threadId,
          provider: "imap",
          subject: parsed.subject || "(no subject)",
          from: parsed.from,
          snippet: parsed.body.slice(0, 240),
          labels: [],
          receivedAt: parsed.date,
          messages: [
            {
              id: threadId,
              from: parsed.from,
              to: parsed.to,
              subject: parsed.subject,
              body: parsed.body,
              date: parsed.date,
              messageIdHeader: parsed.messageId,
            },
          ],
        } satisfies ThreadDetail;
      } finally {
        await client.logout();
      }
    },
    async sampleSent(max) {
      const client = await open(config.imap.sentMailbox);
      try {
        const uids = (await client.searchAll()).slice(-max);
        const samples: ToneSample[] = [];
        for (const uid of uids) {
          const parsed = parseMimeMessage(await client.fetchRfc822(uid));
          samples.push({
            subject: parsed.subject,
            body: parsed.body,
          });
        }
        return samples;
      } finally {
        await client.logout();
      }
    },
    async applyBucket(threadId, bucket) {
      const client = await open(config.imap.inboxMailbox);
      try {
        const folder = imapFolderForBucket(bucket);
        await client.ensureMailbox(folder);
        await client.copy(Number(threadId), folder);
        await client.storeKeyword(Number(threadId), `triage/${bucket}`);
        return {
          applied: true,
          sent: false,
          provider: "imap",
          threadId,
          bucket,
          label: folder,
        } satisfies BucketApplyResult;
      } finally {
        await client.logout();
      }
    },
    async createDraftReply(input: DraftReplyInput) {
      const client = await open(config.imap.inboxMailbox);
      try {
        const rfc822 = buildRfc822({
          to: input.to,
          subject: input.subject,
          body: input.body,
          inReplyTo: input.inReplyTo,
          references: input.inReplyTo,
        });
        const draftId = await client.appendDraft(
          config.imap.draftsMailbox,
          rfc822,
        );
        return {
          drafted: true,
          sent: false,
          provider: "imap",
          draftId,
          threadId: input.threadId,
          mailbox: "Drafts",
        } satisfies DraftReplyResult;
      } finally {
        await client.logout();
      }
    },
  };
}
