import type { InboundLeadConfig } from "../lead-config";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  TYPEFORM_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { takeOldestEligible } from "../cursor-store";
import { parseLeadEvent } from "../lead-events";
import type { LeadFields } from "../untrusted";
import { crmFetch, readJson } from "./http";

export type TypeformClient = {
  listResponsesSince(input: {
    readonly since: string;
    readonly seenIds: readonly string[];
    readonly max?: number;
  }): Promise<readonly LeadFields[]>;
};

export type TypeformClientResult =
  | { readonly ok: true; readonly value: TypeformClient }
  | {
      readonly ok: false;
      readonly note: string;
      readonly missingEnv: readonly string[];
    };

export function createTypeformClient(
  config: InboundLeadConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): TypeformClientResult {
  const connectUid = config.typeform.connectUid;
  const formId = config.typeform.formId;
  if (!(connectUid && formId)) {
    return {
      ok: false,
      note: "Typeform Connect is not configured.",
      missingEnv: [
        ...(connectUid ? [] : ["INBOUND_LEAD_TYPEFORM_CONNECT_UID"]),
        ...(formId ? [] : ["INBOUND_LEAD_TYPEFORM_FORM_ID"]),
      ],
    };
  }

  const token = createAccessTokenCache(() =>
    mintConnectAccessToken({
      connectorUid: connectUid,
      scopes: TYPEFORM_CONNECT_SCOPES,
      mintImpl,
    }),
  );

  return {
    ok: true,
    value: {
      async listResponsesSince({ since, seenIds, max = 25 }) {
        const leads: LeadFields[] = [];
        let page = 1;
        for (;;) {
          const params = new URLSearchParams({
            since,
            page_size: "100",
            page: String(page),
            completed: "true",
          });
          const response = await crmFetch({
            fetchImpl,
            url: `https://api.typeform.com/forms/${encodeURIComponent(formId)}/responses?${params.toString()}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${await token()}`,
              Accept: "application/json",
            },
          });
          const body = await readJson<{
            items?: unknown[];
            page_count?: number;
          }>(response);
          const items = body.items ?? [];
          for (const item of items) {
            const parsed = parseLeadEvent({
              body: { form_response: item },
              sourceHint: "typeform",
            });
            if ("ignored" in parsed) {
              continue;
            }
            if (parsed.lead.id && seenIds.includes(parsed.lead.id)) {
              continue;
            }
            leads.push({ ...parsed.lead, source: "typeform" });
          }
          const pageCount = body.page_count ?? 1;
          if (page >= pageCount || items.length === 0) {
            break;
          }
          page += 1;
        }
        return takeOldestEligible(leads, max);
      },
    },
  };
}
