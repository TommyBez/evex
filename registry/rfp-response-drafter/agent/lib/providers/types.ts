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
  readonly webViewLink?: string;
};

export type DriveFolderListing = {
  readonly role: "rfp" | "pack";
  readonly folderId?: string;
  readonly files: readonly DriveFile[];
};

export type DriveExport = DriveFile & {
  readonly kind: "rfp" | "pack";
  readonly encoding: "text" | "binary";
  readonly text?: string;
  readonly bytes?: Uint8Array;
  readonly driveUrl: string;
};

export type DriveSource = DriveExport;

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
  listConfiguredFolders(): Promise<{
    readonly rfp: DriveFolderListing;
    readonly pack: DriveFolderListing;
  }>;
  exportFile(input: {
    readonly fileId: string;
    readonly kind: "rfp" | "pack";
  }): Promise<DriveExport>;
  readFile(input: {
    readonly fileId: string;
    readonly kind: "rfp" | "pack";
  }): Promise<DriveSource>;
  createDraftDoc(input: {
    readonly title: string;
    readonly body: string;
  }): Promise<DriveDraftResult>;
};
