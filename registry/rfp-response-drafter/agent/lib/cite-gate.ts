export type PackSource = {
  readonly sourceId: string;
  readonly title: string;
  readonly kind: "rfp" | "pack";
  readonly origin: "drive" | "sandbox";
  readonly path?: string;
  readonly workspacePath?: string;
  readonly driveFileId?: string;
  readonly driveUrl?: string;
};

export type Citation = {
  readonly sourceId: string;
  readonly locator?: string;
};

export type DraftClaim = {
  readonly text: string;
  readonly citation: Citation;
};

export type DraftSection = {
  readonly heading: string;
  readonly body: string;
  readonly claims: readonly DraftClaim[];
  readonly openQuestions?: readonly string[];
};

export type CiteGateFailure = {
  readonly ok: false;
  readonly drafted: false;
  readonly note: string;
  readonly uncited: readonly string[];
};

export type CiteGateSuccess = {
  readonly ok: true;
  readonly drafted: true;
  readonly sections: readonly DraftSection[];
  readonly citedSourceIds: readonly string[];
};

export type CiteGateResult = CiteGateSuccess | CiteGateFailure;

const DRIVE_ID_IN_PATH =
  /\/(?:document|file|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/i;
const DRIVE_ID_QUERY = /[?&]id=([a-zA-Z0-9_-]+)/i;

export function normalizeCitePath(value: string): string {
  return value
    .trim()
    .replaceAll("\\", "/")
    .replace(/^sandbox:/i, "")
    .replace(/^\/workspace\//, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export function extractDriveFileId(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const prefixed = /^drive:([a-zA-Z0-9_-]+)$/i.exec(trimmed);
  if (prefixed?.[1]) {
    return prefixed[1];
  }
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    const fromPath = DRIVE_ID_IN_PATH.exec(parsed.pathname);
    if (fromPath?.[1]) {
      return fromPath[1];
    }
    const fromQuery = DRIVE_ID_QUERY.exec(`${parsed.search}${parsed.hash}`);
    if (fromQuery?.[1]) {
      return fromQuery[1];
    }
  } catch {
    const fromPath = DRIVE_ID_IN_PATH.exec(trimmed);
    if (fromPath?.[1]) {
      return fromPath[1];
    }
  }
  return undefined;
}

export function citationAliases(source: PackSource): readonly string[] {
  const aliases = new Set<string>();
  const add = (value: string | undefined) => {
    const trimmed = value?.trim();
    if (trimmed) {
      aliases.add(trimmed);
    }
  };

  add(source.sourceId);
  add(source.path);
  add(source.workspacePath);
  add(source.driveFileId);
  add(source.driveUrl);

  if (source.path) {
    const relative = normalizeCitePath(source.path);
    add(relative);
    add(`sandbox:${relative}`);
    add(`/workspace/${relative}`);
  }
  if (source.workspacePath) {
    add(normalizeCitePath(source.workspacePath));
  }
  if (source.driveFileId) {
    add(`drive:${source.driveFileId}`);
    add(`https://drive.google.com/file/d/${source.driveFileId}/view`);
    add(`https://docs.google.com/document/d/${source.driveFileId}`);
    add(`https://docs.google.com/document/d/${source.driveFileId}/edit`);
  }

  return [...aliases];
}

export function resolveCitedSource(
  citation: string,
  sources: readonly PackSource[],
): PackSource | undefined {
  const trimmed = citation.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const citationPath = normalizeCitePath(trimmed);
  const citationDriveId = extractDriveFileId(trimmed);

  for (const source of sources) {
    if (citationAliases(source).includes(trimmed)) {
      return source;
    }
    if (citationPath.length > 0) {
      for (const alias of citationAliases(source)) {
        if (normalizeCitePath(alias) === citationPath) {
          return source;
        }
      }
    }
    if (citationDriveId && source.driveFileId === citationDriveId) {
      return source;
    }
    if (citationDriveId && source.sourceId === `drive:${citationDriveId}`) {
      return source;
    }
  }

  return undefined;
}

export function evaluateCiteGate(input: {
  readonly sections: readonly DraftSection[];
  readonly sources: readonly PackSource[];
}): CiteGateResult {
  if (input.sections.length === 0) {
    return {
      ok: false,
      drafted: false,
      note: "Cite gate failed closed. At least one section with cited claims is required.",
      uncited: [],
    };
  }

  if (input.sources.length === 0) {
    return {
      ok: false,
      drafted: false,
      note: "Cite gate failed closed. Ingest an RFP or knowledge pack before drafting.",
      uncited: [],
    };
  }

  const uncited: string[] = [];
  const citedSourceIds: string[] = [];

  for (const section of input.sections) {
    if (section.body.trim().length === 0) {
      uncited.push(`${section.heading}: empty body`);
      continue;
    }
    if (section.claims.length === 0) {
      uncited.push(`${section.heading}: no cited claims`);
      continue;
    }

    const citedClaims: string[] = [];
    for (const claim of section.claims) {
      const claimText = claim.text.trim();
      const sourceId = claim.citation.sourceId.trim();
      if (claimText.length === 0) {
        uncited.push(`${section.heading}: empty claim`);
        continue;
      }
      if (sourceId.length === 0) {
        uncited.push(`${section.heading}: uncited claim`);
        continue;
      }
      const matched = resolveCitedSource(sourceId, input.sources);
      if (!matched) {
        uncited.push(`${section.heading}: unknown citation ${sourceId}`);
        continue;
      }
      citedClaims.push(claimText);
      if (!citedSourceIds.includes(matched.sourceId)) {
        citedSourceIds.push(matched.sourceId);
      }
    }

    for (const assertion of bodyAssertions(section.body)) {
      if (!isBodyAssertionCovered(assertion, citedClaims)) {
        uncited.push(`${section.heading}: uncited body ${assertion}`);
      }
    }
  }

  if (uncited.length > 0) {
    return {
      ok: false,
      drafted: false,
      note: "Cite gate failed closed. Every claim and every body assertion needs a pack path and/or Drive file id or URL from the ingested sources.",
      uncited,
    };
  }

  return {
    ok: true,
    drafted: true,
    sections: input.sections,
    citedSourceIds,
  };
}

export function collectOpenQuestions(
  sections: readonly DraftSection[],
  extra: readonly string[] = [],
): readonly string[] {
  const questions: string[] = [];
  for (const section of sections) {
    for (const question of section.openQuestions ?? []) {
      const trimmed = question.trim();
      if (trimmed.length > 0 && !questions.includes(trimmed)) {
        questions.push(trimmed);
      }
    }
  }
  for (const question of extra) {
    const trimmed = question.trim();
    if (trimmed.length > 0 && !questions.includes(trimmed)) {
      questions.push(trimmed);
    }
  }
  return questions;
}

export function bodyAssertions(body: string): readonly string[] {
  return body
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

const normalizeAssertion = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .replace(/[.,;:!?]+$/g, "")
    .trim();

export function isBodyAssertionCovered(
  assertion: string,
  citedClaims: readonly string[],
): boolean {
  const normalizedAssertion = normalizeAssertion(assertion);
  if (normalizedAssertion.length === 0) {
    return true;
  }
  return citedClaims.some((claim) => {
    const normalizedClaim = normalizeAssertion(claim);
    return (
      normalizedClaim.length > 0 &&
      (normalizedAssertion.includes(normalizedClaim) ||
        normalizedClaim.includes(normalizedAssertion))
    );
  });
}

export function evaluateSmeWriteGate(input: {
  readonly openQuestions: readonly string[];
  readonly approvedRecord?: {
    readonly status: "approved" | "pending";
    readonly questions: readonly string[];
  } | null;
}):
  | { readonly ok: true }
  | { readonly ok: false; readonly note: string; readonly openQuestions: readonly string[] } {
  if (input.openQuestions.length === 0) {
    return { ok: true };
  }
  const record = input.approvedRecord;
  if (
    record?.status === "approved" &&
    input.openQuestions.every((question) => record.questions.includes(question))
  ) {
    return { ok: true };
  }
  return {
    ok: false,
    note: "Open SME questions remain. Call ask_sme_questions, then record_sme_reply after a correlated SME Slack reply. write_approved_draft checks the durable approval record.",
    openQuestions: input.openQuestions,
  };
}
