import type { InboundLeadConfig } from "../lead-config";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  PIPEDRIVE_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { ApprovalGrant } from "../write-guard";
import { takeOldestEligible } from "../cursor-store";
import { crmFetch, readJson } from "./http";
import type { CrmClient, CrmLeadRecord, CrmNoteDraft } from "./types";

type PipedrivePerson = {
  readonly id: number | string;
  readonly name?: string;
  readonly add_time?: string;
  readonly email?: readonly { readonly value?: string }[] | string;
  readonly phone?: readonly { readonly value?: string }[] | string;
  readonly org_name?: string;
  readonly job_title?: string;
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

const toRecord = (person: PipedrivePerson): CrmLeadRecord => {
  const names = splitName(person.name);
  return {
    id: String(person.id),
    email: firstValue(person.email),
    firstName: names.firstName,
    lastName: names.lastName,
    phone: firstValue(person.phone),
    company: person.org_name,
    title: person.job_title,
    submittedAt: person.add_time,
    source: "crm",
  };
};

export function createPipedriveClient(
  config: InboundLeadConfig,
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
    async listNewSince({ since, seenIds, max = 50 }) {
      const collected: CrmLeadRecord[] = [];
      let cursor: string | undefined;
      for (;;) {
        const params = new URLSearchParams({
          limit: "100",
          sort_by: "add_time",
          sort_direction: "desc",
        });
        if (cursor) {
          params.set("cursor", cursor);
        }
        const response = await crmFetch({
          fetchImpl,
          url: `https://api.pipedrive.com/api/v2/persons?${params.toString()}`,
          method: "GET",
          headers: await headers(),
        });
        const body = await readJson<{
          data?: PipedrivePerson[];
          additional_data?: {
            readonly next_cursor?: string;
            readonly pagination?: { readonly next_cursor?: string };
          };
        }>(response);
        const page = body.data ?? [];
        let reachedKnown = false;
        for (const person of page) {
          const record = toRecord(person);
          if (record.submittedAt && record.submittedAt <= since) {
            reachedKnown = true;
            break;
          }
          if (!seenIds.includes(record.id)) {
            collected.push(record);
          }
        }
        const nextCursor =
          body.additional_data?.next_cursor ??
          body.additional_data?.pagination?.next_cursor;
        if (reachedKnown || !nextCursor || page.length === 0) {
          break;
        }
        cursor = nextCursor;
      }
      return takeOldestEligible(collected, max);
    },
    async findContactByEmail(email) {
      const response = await crmFetch({
        fetchImpl,
        url: `https://api.pipedrive.com/api/v2/persons/search?term=${encodeURIComponent(email)}&fields=email&limit=1`,
        method: "GET",
        headers: await headers(),
      });
      const body = await readJson<{
        data?: { items?: { item?: PipedrivePerson }[] };
      }>(response);
      const first = body.data?.items?.[0]?.item;
      return first ? toRecord(first) : null;
    },
    async upsertContactAndNote({ draft, grant }) {
      return writePipedriveNote({ fetchImpl, headers, draft, grant });
    },
  };
}

async function writePipedriveNote(input: {
  readonly fetchImpl: FetchLike;
  readonly headers: () => Promise<Record<string, string>>;
  readonly draft: CrmNoteDraft;
  readonly grant: ApprovalGrant;
}): Promise<{
  readonly written: true;
  readonly contactId: string;
  readonly noteId?: string;
}> {
  const auth = await input.headers();
  const lookup = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: `https://api.pipedrive.com/api/v2/persons/search?term=${encodeURIComponent(input.draft.email)}&fields=email&limit=1`,
    method: "GET",
    headers: auth,
  });
  const found = (
    await readJson<{ data?: { items?: { item?: { id?: number | string } }[] } }>(
      lookup,
    )
  ).data?.items?.[0]?.item?.id;

  const name = [input.draft.firstName, input.draft.lastName]
    .filter(Boolean)
    .join(" ");
  const personBody = {
    name: name || input.draft.email,
    emails: [{ value: input.draft.email, primary: true }],
    phones: input.draft.phone
      ? [{ value: input.draft.phone, primary: true }]
      : undefined,
    job_title: input.draft.title,
    org_name: input.draft.company,
  };

  let contactId = found ? String(found) : input.draft.leadId;
  if (found) {
    await crmFetch({
      fetchImpl: input.fetchImpl,
      url: `https://api.pipedrive.com/api/v2/persons/${found}`,
      method: "PATCH",
      headers: auth,
      body: JSON.stringify(personBody),
      grant: input.grant,
      leadId: input.draft.leadId,
    });
  } else {
    const created = await crmFetch({
      fetchImpl: input.fetchImpl,
      url: "https://api.pipedrive.com/api/v2/persons",
      method: "POST",
      headers: auth,
      body: JSON.stringify(personBody),
      grant: input.grant,
      leadId: input.draft.leadId,
    });
    const body = await readJson<{ data?: { id?: number | string } }>(created);
    contactId = body.data?.id ? String(body.data.id) : contactId;
  }

  const note = await crmFetch({
    fetchImpl: input.fetchImpl,
    url: "https://api.pipedrive.com/api/v2/notes",
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      content: input.draft.body,
      person_id: Number.parseInt(contactId, 10) || contactId,
    }),
    grant: input.grant,
    leadId: input.draft.leadId,
  });
  const noteBody = await readJson<{ data?: { id?: number | string } }>(note);
  return {
    written: true,
    contactId,
    noteId: noteBody.data?.id ? String(noteBody.data.id) : undefined,
  };
}
