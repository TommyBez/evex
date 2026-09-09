import type { InboundLeadConfig } from "../lead-config";
import {
  inboundLeadConfig,
  isCrmConfigured,
  missingCrmProviderEnv,
} from "../lead-config";
import type { ConnectTokenMint, FetchLike } from "../oauth";
import { createHubSpotClient } from "./hubspot";
import { createPipedriveClient } from "./pipedrive";
import { createSalesforceClient } from "./salesforce";
import type { CrmClient, CrmClientResult } from "./types";

export function createConfiguredCrmClient(
  config: InboundLeadConfig = inboundLeadConfig,
  options: {
    readonly fetchImpl?: FetchLike;
    readonly mintImpl?: ConnectTokenMint;
  } = {},
): CrmClientResult<CrmClient> {
  if (!isCrmConfigured(config)) {
    const missing = missingCrmProviderEnv(config);
    return {
      ok: false,
      note:
        missing.length > 0
          ? `CRM is not configured. Missing ${missing.join(", ")}.`
          : "Set CRM_PROVIDER to hubspot, salesforce, or pipedrive and the matching Connect UID.",
      missingEnv:
        missing.length > 0
          ? missing
          : ["CRM_PROVIDER", "INBOUND_LEAD_HUBSPOT_CONNECT_UID"],
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
    ok: true,
    value: createPipedriveClient(config, options.fetchImpl, options.mintImpl),
  };
}
