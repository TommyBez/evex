import type { ChurnRenewalConfig } from "../renewal-config";
import {
  churnRenewalConfig,
  missingCrmProviderEnv,
} from "../renewal-config";
import type { ConnectTokenMint, FetchLike } from "../oauth";
import { createHubSpotClient } from "./hubspot";
import { createSalesforceClient } from "./salesforce";
import type { CrmClient, CrmClientResult } from "./types";

export function createConfiguredCrmClient(
  config: ChurnRenewalConfig = churnRenewalConfig,
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

  return {
    ok: false,
    note: "Set CRM_PROVIDER to hubspot or salesforce and the matching Connect UID.",
    missingEnv: ["CRM_PROVIDER"],
  };
}
