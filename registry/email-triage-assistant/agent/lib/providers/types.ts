import type { EmailProvider } from "../email-config";
import type { ToneProfile, ToneSample } from "../tone-profile";

export type InboxThread = {
  readonly id: string;
  readonly provider: EmailProvider;
  readonly subject: string;
  readonly from: string;
  readonly snippet: string;
  readonly labels: readonly string[];
  readonly receivedAt: string | null;
};

export type ThreadMessage = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly date: string | null;
  readonly messageIdHeader?: string;
};

export type ThreadDetail = InboxThread & {
  readonly messages: readonly ThreadMessage[];
};

export type DraftReplyInput = {
  readonly threadId: string;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly inReplyTo?: string;
};

export type DraftReplyResult = {
  readonly drafted: true;
  readonly sent: false;
  readonly provider: EmailProvider;
  readonly draftId: string;
  readonly threadId: string;
  readonly mailbox: "Drafts";
};

export type BucketApplyResult = {
  readonly applied: true;
  readonly sent: false;
  readonly provider: EmailProvider;
  readonly threadId: string;
  readonly bucket: string;
  readonly label: string;
};

export type EmailMailbox = {
  readonly provider: EmailProvider;
  listThreads(input: {
    readonly max: number;
  }): Promise<readonly InboxThread[]>;
  readThread(threadId: string): Promise<ThreadDetail>;
  sampleSent(max: number): Promise<readonly ToneSample[]>;
  applyBucket(
    threadId: string,
    bucket: string,
  ): Promise<BucketApplyResult>;
  createDraftReply(input: DraftReplyInput): Promise<DraftReplyResult>;
};

export type MailboxResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly note: string; readonly missingEnv?: string[] };

export type ToneSampleResult = {
  readonly profile: ToneProfile;
  readonly samples: readonly ToneSample[];
};
