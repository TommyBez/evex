import type { OpenInvoice } from "../aging";

export type ArClient = {
  readonly provider: "quickbooks" | "xero";
  listOpenInvoices(input: { readonly max: number }): Promise<OpenInvoice[]>;
  getInvoice(id: string): Promise<OpenInvoice | null>;
};

export type ArClientResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false;
      readonly note: string;
      readonly missingEnv: readonly string[];
    };

export type ReminderDraftInput = {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly invoiceId: string;
};

export type ReminderDraftResult = {
  readonly drafted: true;
  readonly sent: false;
  readonly provider: "gmail" | "outlook";
  readonly draftId: string;
  readonly invoiceId: string;
  readonly mailbox: "Drafts";
};

export type MailboxClient = {
  readonly provider: "gmail" | "outlook";
  createReminderDraft(input: ReminderDraftInput): Promise<ReminderDraftResult>;
};

export type MailboxClientResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false;
      readonly note: string;
      readonly missingEnv: readonly string[];
    };
