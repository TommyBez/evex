import {
  missingMailboxEnv,
  type RfpResponseConfig,
  type WritebackTarget,
} from "./rfp-config";

export type WritebackPreflight =
  | { readonly ok: true; readonly targets: readonly WritebackTarget[] }
  | {
      readonly ok: false;
      readonly note: string;
      readonly missingEnv: readonly string[];
      readonly targets: readonly WritebackTarget[];
    };

export function writebackTargets(
  target: WritebackTarget,
): readonly ("drive" | "mailbox")[] {
  if (target === "both") {
    return ["drive", "mailbox"];
  }
  return [target];
}

export function preflightWriteback(
  target: WritebackTarget,
  config: RfpResponseConfig,
): WritebackPreflight {
  const targets = writebackTargets(target);
  const missing: string[] = [];
  if (targets.includes("drive") && !config.google.connectUid) {
    missing.push("RFP_RESPONSE_GOOGLE_CONNECT_UID");
  }
  if (targets.includes("mailbox")) {
    missing.push(...missingMailboxEnv(config));
  }
  if (missing.length > 0) {
    return {
      ok: false,
      note: `Write-back preflight failed for ${target}. Missing ${missing.join(", ")} before any Drive or mailbox write.`,
      missingEnv: missing,
      targets,
    };
  }
  return { ok: true, targets };
}

export async function executeApprovedWrite<TDrive, TMailbox>(input: {
  readonly target: WritebackTarget;
  readonly config: RfpResponseConfig;
  readonly writeDrive: () => Promise<
    | { readonly ok: true; readonly value: TDrive }
    | { readonly ok: false; readonly note: string; readonly missingEnv: readonly string[] }
  >;
  readonly writeMailbox: () => Promise<
    | { readonly ok: true; readonly value: TMailbox }
    | { readonly ok: false; readonly note: string; readonly missingEnv: readonly string[] }
  >;
}): Promise<
  | {
      readonly drafted: true;
      readonly sent: false;
      readonly submitted: false;
      readonly drive?: TDrive;
      readonly mailbox?: TMailbox;
      readonly partial?: true;
      readonly note?: string;
      readonly missingEnv?: readonly string[];
    }
  | {
      readonly drafted: false;
      readonly sent: false;
      readonly submitted: false;
      readonly note: string;
      readonly missingEnv?: readonly string[];
      readonly preflightFailed?: boolean;
    }
> {
  const preflight = preflightWriteback(input.target, input.config);
  if (!preflight.ok) {
    return {
      drafted: false,
      sent: false,
      submitted: false,
      preflightFailed: true,
      note: preflight.note,
      missingEnv: preflight.missingEnv,
    };
  }

  const driveResult =
    input.target === "mailbox" ? undefined : await input.writeDrive();
  if (driveResult && !driveResult.ok) {
    return {
      drafted: false,
      sent: false,
      submitted: false,
      note: driveResult.note,
      missingEnv: driveResult.missingEnv,
    };
  }

  const mailboxResult =
    input.target === "drive" ? undefined : await input.writeMailbox();
  if (mailboxResult && !mailboxResult.ok) {
    if (driveResult?.ok) {
      return {
        drafted: true,
        sent: false,
        submitted: false,
        partial: true,
        drive: driveResult.value,
        note: `Drive draft written; mailbox write failed after preflight: ${mailboxResult.note}`,
        missingEnv: mailboxResult.missingEnv,
      };
    }
    return {
      drafted: false,
      sent: false,
      submitted: false,
      note: mailboxResult.note,
      missingEnv: mailboxResult.missingEnv,
    };
  }

  return {
    drafted: true,
    sent: false,
    submitted: false,
    drive: driveResult?.value,
    mailbox: mailboxResult?.value,
  };
}
