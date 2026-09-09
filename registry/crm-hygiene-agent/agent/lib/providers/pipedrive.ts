import type { CrmHygieneConfig } from "../crm-config";
import type { CrmRecord, HygieneProposal } from "../hygiene";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  PIPEDRIVE_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { crmFetch, readJson } from "./http";
import type { CrmClient } from "./types";

type PipedrivePerson = {
  readonly id: number | string;
  readonly name?: string;
  readonly email?: readonly { readonly value?: string }[] | string;
  readonly phone?: readonly { readonly value?: string }[] | string;
  readonly org_name?: string;
  readonly org_id?: { readonly name?: string };
};

const firstValue = (
  value: PipedrivePerson["email"],
): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  return value?.find((item) => item.value)?.value;
};

const splitName = (
  name: string | undefined,
): { firstName?: string; lastName?: string } => {
  const parts = name?.trim().split(/\s+/) ?? [];
  if (parts.length === 0) {
    return {};
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || undefined,
  };
};

const toRecord = (person: PipedrivePerson): CrmRecord => {
  const names = splitName(person.name);
  return {
    id: String(person.id),
    email: firstValue(person.email),
    firstName: names.firstName,
    lastName: names.lastName,
    phone: firstValue(person.phone),
    company: person.org_name ?? person.org_id?.name,
  };
};

const bodyOf = (proposal: HygieneProposal): Record<string, unknown> => {
  const name = [proposal.after.firstName, proposal.after.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const body: Record<string, unknown> = {};
  if (name) {
    body.name = name;
  }
  if (proposal.after.email) {
    body.email = [{ value: proposal.after.email, primary: true }];
  }
  if (proposal.after.phone) {
    body.phone = [{ value: proposal.after.phone, primary: true }];
  }
  return body;
};

export function createPipedriveClient(
  config: CrmHygieneConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): CrmClient {
  const connectUid = config.pipedrive.connectUid ?? "";
  const token = createAccessTokenCache(() =>
    mintConnectAccessToken({
      connectorUid: connectUid,
      scopes: PIPEDRIVE_CONNECT_SCOPES,
      mintImpl,
    }),
  );

  const headers = async (): Promise<Record<string, string>> => ({
    Authorization: `Bearer ${await token()}`,
    "Content-Type": "application/json",
  });

  return {
    provider: "pipedrive",
    async listRecords({ max }) {
      const response = await crmFetch({
        fetchImpl,
        url: `https://api.pipedrive.com/v1/persons?limit=${max}`,
        method: "GET",
        headers: await headers(),
      });
      const body = await readJson<{ data?: PipedrivePerson[] }>(response);
      return (body.data ?? []).slice(0, max).map(toRecord);
    },
    async applyWrites({ batchId, proposals, grant }) {
      const applied: string[] = [];
      for (const proposal of proposals) {
        if (proposal.kind === "dedupe" && proposal.mergeRecordId) {
          await crmFetch({
            fetchImpl,
            url: `https://api.pipedrive.com/v1/persons/${proposal.mergeRecordId}/merge`,
            method: "PUT",
            headers: await headers(),
            body: JSON.stringify({ merge_with_id: Number(proposal.recordId) }),
            grant,
            batchId,
          });
          applied.push(proposal.id);
          continue;
        }

        const body = bodyOf(proposal);
        if (Object.keys(body).length === 0) {
          continue;
        }
        await crmFetch({
          fetchImpl,
          url: `https://api.pipedrive.com/v1/persons/${proposal.recordId}`,
          method: "PUT",
          headers: await headers(),
          body: JSON.stringify(body),
          grant,
          batchId,
        });
        applied.push(proposal.id);
      }
      return { written: true as const, applied };
    },
  };
}
