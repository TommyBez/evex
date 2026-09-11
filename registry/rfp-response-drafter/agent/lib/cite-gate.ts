export type PackSource = {
  readonly sourceId: string;
  readonly title: string;
  readonly kind: "rfp" | "pack";
  readonly origin: "drive" | "sandbox";
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

const sourceIndex = (sources: readonly PackSource[]): Map<string, PackSource> => {
  const index = new Map<string, PackSource>();
  for (const source of sources) {
    index.set(source.sourceId, source);
  }
  return index;
};

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

  const sources = sourceIndex(input.sources);
  if (sources.size === 0) {
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
      if (!sources.has(sourceId)) {
        uncited.push(`${section.heading}: unknown citation ${sourceId}`);
        continue;
      }
      if (!citedSourceIds.includes(sourceId)) {
        citedSourceIds.push(sourceId);
      }
    }
  }

  if (uncited.length > 0) {
    return {
      ok: false,
      drafted: false,
      note: "Cite gate failed closed. Every claim needs a file citation from the ingested pack.",
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
  return questions;
}
