import type { CrmHygieneConfig } from "../crm-config";
import {
  crmHygieneConfig,
  missingCrmProviderEnv,
} from "../crm-config";
import type { ConnectTokenMint, FetchLike } from "../oauth";
import { createHubSpotClient } from "./hubspot";
import { createPipedriveClient } from "./pipedrive";
import { createSalesforceClient } from "./salesforce";
import type { CrmClient, CrmClientResult } from "./types";

export function batchProviderMismatch(
  batchProvider: string,
  configuredProvider: string,
): string | undefined {
  if (batchProvider !== configuredProvider) {
    return `Batch provider ${batchProvider} does not match configured CRM_PROVIDER ${configuredProvider}.`;
  }
}

export function createConfiguredCrmClient(
  config: CrmHygieneConfig = crmHygieneConfig,
  options: {
    readonly fetchImpl?: FetchLike;
    readonly mintImpl?: ConnectTokenMint;
  } = {},
): CrmClientResult<CrmClient> {
  const missing = missingCrmProviderEnv(config);
  if (missing.length > 0) {
    return {
      ok: false,
      note: `CRM is not configured. Missing ${missing.join(", ")}.`,
      missingEnv: missing,
    };
  }

  if (config.provider === "hubspot") {
    return {
      ok: true,
      value: createHubSpotClient(config, options.fetchImpl, options.mintImpl),
    };
  }
  if (config.provider === "salesforce") {
    return {
      ok: true,
      value: createSalesforceClient(config, options.fetchImpl, options.mintImpl),
    };
  }
  if (config.provider === "pipedrive") {
    return {
      ok: true,
      value: createPipedriveClient(config, options.fetchImpl, options.mintImpl),
    };
  }

  return {
    ok: false,
    note: "Set CRM_PROVIDER to hubspot, salesforce, or pipedrive and the matching Connect UID.",
    missingEnv: ["CRM_PROVIDER"],
  };
}
