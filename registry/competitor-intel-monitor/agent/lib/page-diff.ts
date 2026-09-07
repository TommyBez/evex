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

const countTokens = (tokens: readonly string[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
};

const leftoverTokens = (counts: Map<string, number>): string[] => {
  const leftover: string[] = [];
  for (const [token, count] of counts) {
    for (let index = 0; index < count; index += 1) {
      leftover.push(token);
    }
  }
  return leftover;
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

  const beforeCounts = countTokens(tokenize(before));
  const afterCounts = countTokens(tokenize(after));
  const addedCounts = new Map<string, number>();
  const removedCounts = new Map<string, number>();

  const keys = new Set([...beforeCounts.keys(), ...afterCounts.keys()]);
  let changedChars = 0;
  for (const key of keys) {
    const beforeCount = beforeCounts.get(key) ?? 0;
    const afterCount = afterCounts.get(key) ?? 0;
    const delta = afterCount - beforeCount;
    if (delta > 0) {
      addedCounts.set(key, delta);
      changedChars += delta * key.length;
    } else if (delta < 0) {
      removedCounts.set(key, -delta);
      changedChars += -delta * key.length;
    }
  }

  const addedWords = leftoverTokens(addedCounts).slice(0, EXCERPT_WORDS);
  const removedWords = leftoverTokens(removedCounts).slice(0, EXCERPT_WORDS);
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
