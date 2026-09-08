import { createHash } from "node:crypto";

export type PageDiff = {
  readonly changed: boolean;
  readonly changedChars: number;
  readonly score: number;
  readonly addedWords: readonly string[];
  readonly removedWords: readonly string[];
  readonly excerpt: string;
};

const SCRIPT_OR_STYLE = /<(script|style)[\s\S]*?<\/\1>/gi;
const TAGS = /<[^>]+>/g;
const ENTITIES: Readonly<Record<string, string>> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};
const ENTITY_PATTERN = /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g;
const WHITESPACE = /\s+/g;
const EXCERPT_WORDS = 24;

export const normalizePageText = (html: string): string =>
  html
    .replace(SCRIPT_OR_STYLE, " ")
    .replace(TAGS, " ")
    .replace(ENTITY_PATTERN, (entity) => ENTITIES[entity] ?? entity)
    .replace(WHITESPACE, " ")
    .trim();

export const hashNormalizedText = (text: string): string =>
  createHash("sha256").update(text).digest("hex");

const tokenize = (text: string): string[] => text.split(WHITESPACE).filter(Boolean);

const diffTokenSequences = (
  beforeTokens: readonly string[],
  afterTokens: readonly string[],
): { readonly added: string[]; readonly removed: string[] } => {
  const beforeLength = beforeTokens.length;
  const afterLength = afterTokens.length;
  const table: number[][] = Array.from({ length: beforeLength + 1 }, () =>
    Array.from({ length: afterLength + 1 }, () => 0),
  );

  for (let beforeIndex = 1; beforeIndex <= beforeLength; beforeIndex += 1) {
    for (let afterIndex = 1; afterIndex <= afterLength; afterIndex += 1) {
      const row = table[beforeIndex];
      if (!row) {
        continue;
      }
      row[afterIndex] =
        beforeTokens[beforeIndex - 1] === afterTokens[afterIndex - 1]
          ? (table[beforeIndex - 1]?.[afterIndex - 1] ?? 0) + 1
          : Math.max(table[beforeIndex - 1]?.[afterIndex] ?? 0, row[afterIndex - 1] ?? 0);
    }
  }

  const added: string[] = [];
  const removed: string[] = [];
  let beforeIndex = beforeLength;
  let afterIndex = afterLength;
  while (beforeIndex > 0 || afterIndex > 0) {
    if (
      beforeIndex > 0 &&
      afterIndex > 0 &&
      beforeTokens[beforeIndex - 1] === afterTokens[afterIndex - 1]
    ) {
      beforeIndex -= 1;
      afterIndex -= 1;
      continue;
    }
    const moveAfter =
      afterIndex > 0 &&
      (beforeIndex === 0 ||
        (table[beforeIndex]?.[afterIndex - 1] ?? 0) >= (table[beforeIndex - 1]?.[afterIndex] ?? 0));
    if (moveAfter) {
      added.push(afterTokens[afterIndex - 1] ?? "");
      afterIndex -= 1;
      continue;
    }
    removed.push(beforeTokens[beforeIndex - 1] ?? "");
    beforeIndex -= 1;
  }

  added.reverse();
  removed.reverse();
  return { added, removed };
};

export const scoreChangedChars = (
  changedChars: number,
  beforeLength: number,
  afterLength: number,
): number => {
  const denominator = Math.max(beforeLength, afterLength, 1);
  return Math.min(100, Math.round((changedChars / denominator) * 100));
};

export const diffNormalizedText = (before: string, after: string): PageDiff => {
  if (before === after) {
    return {
      changed: false,
      changedChars: 0,
      score: 0,
      addedWords: [],
      removedWords: [],
      excerpt: "",
    };
  }

  const { added, removed } = diffTokenSequences(tokenize(before), tokenize(after));
  const changedChars = [...added, ...removed].reduce((sum, token) => sum + token.length, 0);
  const addedWords = added.slice(0, EXCERPT_WORDS);
  const removedWords = removed.slice(0, EXCERPT_WORDS);
  const excerptParts = [
    addedWords.length > 0 ? `Added: ${addedWords.join(" ")}` : null,
    removedWords.length > 0 ? `Removed: ${removedWords.join(" ")}` : null,
  ].filter((part): part is string => Boolean(part));

  return {
    changed: true,
    changedChars,
    score: scoreChangedChars(changedChars, before.length, after.length),
    addedWords,
    removedWords,
    excerpt: excerptParts.join(" · "),
  };
};
