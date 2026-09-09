import type { InboundLeadConfig } from "./lead-config";
import {
  leadFieldsLookLikeInstructions,
  sanitizeLeadFields,
  type LeadFields,
} from "./untrusted";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
]);

export type EnrichedLead = {
  readonly lead: LeadFields;
  readonly email: string;
  readonly domain: string;
  readonly company: string;
  readonly workEmail: boolean;
  readonly looksLikeInstructions: boolean;
};

export type EnrichLeadResult =
  | {
      readonly enriched: true;
      readonly failClosed: false;
      readonly value: EnrichedLead;
    }
  | {
      readonly enriched: false;
      readonly failClosed: true;
      readonly note: string;
      readonly looksLikeInstructions: boolean;
    };

export function emailDomain(email: string): string | undefined {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) {
    return undefined;
  }
  return email.slice(at + 1).toLowerCase();
}

export function isWorkEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) {
    return false;
  }
  return !FREE_EMAIL_DOMAINS.has(domain);
}

const MULTI_PART_PUBLIC_SUFFIXES = [
  "ac.uk",
  "co.in",
  "co.jp",
  "co.kr",
  "co.nz",
  "co.uk",
  "co.za",
  "com.ar",
  "com.au",
  "com.br",
  "com.cn",
  "com.hk",
  "com.mx",
  "com.sg",
  "com.tw",
  "gov.uk",
  "me.uk",
  "ne.jp",
  "net.au",
  "or.jp",
  "org.au",
  "org.nz",
  "org.uk",
] as const;

export function registrableDomainLabel(domain: string): string {
  const labels = domain
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .split(".")
    .filter(Boolean);
  if (labels.length === 0) {
    return domain;
  }
  const joined = labels.join(".");
  const suffix = MULTI_PART_PUBLIC_SUFFIXES.find(
    (item) => joined === item || joined.endsWith(`.${item}`),
  );
  if (suffix) {
    const index = labels.length - suffix.split(".").length - 1;
    return labels[index] ?? labels[0] ?? domain;
  }
  return labels.length >= 2 ? (labels.at(-2) ?? labels[0]) : (labels[0] ?? domain);
}

export function companyFromDomain(domain: string): string {
  const label = registrableDomainLabel(domain);
  return label
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function refuseInstructionMarkedWrite(lead: LeadFields): string | undefined {
  if (leadFieldsLookLikeInstructions(lead)) {
    return "Refused CRM write. Lead fields looked like instructions.";
  }
}

export function enrichLead(
  raw: LeadFields,
  config: Pick<InboundLeadConfig, "icp">,
): EnrichLeadResult {
  const lead = sanitizeLeadFields(raw);
  const looksLikeInstructions = leadFieldsLookLikeInstructions(lead);
  if (looksLikeInstructions) {
    return {
      enriched: false,
      failClosed: true,
      note: "Enrichment failed closed: lead fields looked like instructions. Fields were treated as untrusted data.",
      looksLikeInstructions: true,
    };
  }
  const email = lead.email?.toLowerCase();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return {
      enriched: false,
      failClosed: true,
      note: "Enrichment failed closed: inbound email is missing or invalid. Fields were treated as untrusted data.",
      looksLikeInstructions,
    };
  }

  const domain = emailDomain(email);
  if (!domain) {
    return {
      enriched: false,
      failClosed: true,
      note: "Enrichment failed closed: email domain could not be parsed.",
      looksLikeInstructions,
    };
  }

  const workEmail = isWorkEmail(email);
  if (config.icp.requireWorkEmail && !workEmail) {
    return {
      enriched: false,
      failClosed: true,
      note: "Enrichment failed closed: a work email is required and this address uses a free or disposable domain.",
      looksLikeInstructions,
    };
  }

  const company = lead.company ?? companyFromDomain(domain);
  if (!company) {
    return {
      enriched: false,
      failClosed: true,
      note: "Enrichment failed closed: company could not be derived from the email domain.",
      looksLikeInstructions,
    };
  }

  return {
    enriched: true,
    failClosed: false,
    value: {
      lead,
      email,
      domain,
      company,
      workEmail,
      looksLikeInstructions,
    },
  };
}
