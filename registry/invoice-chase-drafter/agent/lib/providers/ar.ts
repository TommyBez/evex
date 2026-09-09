import type { InvoiceChaseConfig } from "../chase-config";
import {
  invoiceChaseConfig,
  missingArProviderEnv,
} from "../chase-config";
import type { ConnectTokenMint, FetchLike } from "../oauth";
import { createQuickBooksClient } from "./quickbooks";
import type { ArClient, ArClientResult } from "./types";
import { createXeroClient } from "./xero";

export function createConfiguredArClient(
  config: InvoiceChaseConfig = invoiceChaseConfig,
  options: {
    readonly fetchImpl?: FetchLike;
    readonly mintImpl?: ConnectTokenMint;
  } = {},
): ArClientResult<ArClient> {
  const missing = missingArProviderEnv(config);
  if (missing.length > 0) {
    return {
      ok: false,
      note: `AR is not configured. Missing ${missing.join(", ")}.`,
      missingEnv: missing,
    };
  }

  if (config.arProvider === "quickbooks") {
    return {
      ok: true,
      value: createQuickBooksClient(
        config,
        options.fetchImpl,
        options.mintImpl,
      ),
    };
  }
  if (config.arProvider === "xero") {
    return {
      ok: true,
      value: createXeroClient(config, options.fetchImpl, options.mintImpl),
    };
  }

  return {
    ok: false,
    note: "Set INVOICE_CHASE_AR_PROVIDER to quickbooks or xero and the matching Custom OAuth Connect UID.",
    missingEnv: ["INVOICE_CHASE_AR_PROVIDER"],
  };
}
