import {
  asRecord,
  sanitizeLeadFields,
  stringField,
  type LeadFields,
} from "./untrusted";

export type LeadSource = "form" | "typeform" | "crm" | "generic";

export type ParsedLeadEvent = {
  readonly source: LeadSource;
  readonly reason: "push" | "poll";
  readonly lead: LeadFields;
};

export function parseLeadEvent(input: {
  readonly body?: unknown;
  readonly sourceHint?: LeadSource;
}): ParsedLeadEvent | { readonly ignored: true } {
  const body = asRecord(input.body);
  if (Object.keys(body).length === 0) {
    return { ignored: true };
  }

  const typeform = parseTypeformPayload(body);
  if (typeform) {
    return typeform;
  }

  const crm = parseCrmPayload(body);
  if (crm) {
    return crm;
  }

  const lead = sanitizeLeadFields({
    id: stringField(body, "id", "leadId", "submissionId"),
    email: stringField(body, "email", "work_email", "workEmail"),
    firstName: stringField(body, "firstName", "first_name", "firstname"),
    lastName: stringField(body, "lastName", "last_name", "lastname"),
    company: stringField(body, "company", "company_name", "organization"),
    title: stringField(body, "title", "job_title", "role"),
    phone: stringField(body, "phone", "phone_number"),
    message: stringField(body, "message", "notes", "comment"),
    source: input.sourceHint ?? "form",
    submittedAt: stringField(body, "submittedAt", "submitted_at", "createdAt"),
  });

  if (!(lead.email || lead.id || lead.company)) {
    if (body.reason === "push" || body.type === "lead.push") {
      return {
        source: "generic",
        reason: "push",
        lead: sanitizeLeadFields({ source: "generic" }),
      };
    }
    return { ignored: true };
  }

  return {
    source: input.sourceHint ?? "form",
    reason: "push",
    lead,
  };
}

function parseTypeformPayload(
  body: Record<string, unknown>,
): ParsedLeadEvent | undefined {
  const formResponse = asRecord(body.form_response);
  if (!formResponse.answers && !Array.isArray(body.answers)) {
    return undefined;
  }
  const answers = Array.isArray(formResponse.answers)
    ? formResponse.answers
    : Array.isArray(body.answers)
      ? body.answers
      : [];
  const fields: LeadFields = {
    id:
      stringField(formResponse, "token", "landing_id") ??
      stringField(body, "event_id"),
    submittedAt: stringField(formResponse, "submitted_at"),
    source: "typeform",
  };
  const collected: Record<string, string | undefined> = { ...fields };

  for (const item of answers) {
    const answer = asRecord(item);
    const field = asRecord(answer.field);
    const ref = stringField(field, "ref", "id")?.toLowerCase() ?? "";
    const type = stringField(answer, "type") ?? stringField(field, "type");
    const value =
      stringField(answer, "email", "text", "phone_number") ??
      (typeof answer.number === "number" ? String(answer.number) : undefined);
    if (!value) {
      continue;
    }
    if (type === "email" || ref.includes("email")) {
      collected.email = value;
    } else if (ref.includes("first")) {
      collected.firstName = value;
    } else if (ref.includes("last")) {
      collected.lastName = value;
    } else if (ref.includes("company") || ref.includes("org")) {
      collected.company = value;
    } else if (ref.includes("title") || ref.includes("role")) {
      collected.title = value;
    } else if (type === "phone_number" || ref.includes("phone")) {
      collected.phone = value;
    } else if (!collected.message) {
      collected.message = value;
    }
  }

  return {
    source: "typeform",
    reason: "push",
    lead: sanitizeLeadFields(collected),
  };
}

function parseCrmPayload(
  body: Record<string, unknown>,
): ParsedLeadEvent | undefined {
  const properties = asRecord(body.properties);
  if (typeof body.subscriptionType === "string" || properties.email) {
    return {
      source: "crm",
      reason: "push",
      lead: sanitizeLeadFields({
        id: stringField(body, "objectId", "id"),
        email: stringField(properties, "email") ?? stringField(body, "email"),
        firstName:
          stringField(properties, "firstname", "firstName") ??
          stringField(body, "firstName"),
        lastName:
          stringField(properties, "lastname", "lastName") ??
          stringField(body, "lastName"),
        company: stringField(properties, "company") ?? stringField(body, "company"),
        title: stringField(properties, "jobtitle", "title"),
        phone: stringField(properties, "phone"),
        source: "crm",
      }),
    };
  }
}
