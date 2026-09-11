export type MailboxDraftInput = {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly rfpId: string;
};

export type MailboxDraftResult = {
  readonly drafted: true;
  readonly sent: false;
  readonly submitted: false;
  readonly provider: "gmail" | "outlook";
  readonly draftId: string;
  readonly rfpId: string;
  readonly mailbox: "Drafts";
};

export type MailboxClient = {
  readonly provider: "gmail" | "outlook";
  createDraft(input: MailboxDraftInput): Promise<MailboxDraftResult>;
};

export type ClientResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false;
      readonly note: string;
      readonly missingEnv: readonly string[];
    };

export type DriveFile = {
  readonly id: string;
  readonly name: string;
  readonly mimeType: string;
};

export type DriveSource = DriveFile & {
  readonly content: string;
  readonly kind: "rfp" | "pack";
};

export type DriveDraftResult = {
  readonly drafted: true;
  readonly submitted: false;
  readonly sent: false;
  readonly provider: "drive";
  readonly documentId: string;
  readonly title: string;
};

export type DriveClient = {
  listFiles(input: { readonly folderId?: string }): Promise<readonly DriveFile[]>;
  readFile(input: {
    readonly fileId: string;
    readonly kind: "rfp" | "pack";
  }): Promise<DriveSource>;
  createDraftDoc(input: {
    readonly title: string;
    readonly body: string;
  }): Promise<DriveDraftResult>;
};
