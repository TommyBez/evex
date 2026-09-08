export type ToneSample = {
  readonly subject: string;
  readonly body: string;
};

export type ToneProfile = {
  readonly sampleCount: number;
  readonly greeting: string | null;
  readonly signOff: string | null;
  readonly averageSentenceLength: number;
  readonly firstPersonRate: number;
  readonly brief: string;
};

const GREETING =
  /^(?:hi|hello|hey|dear|good (?:morning|afternoon|evening))[^\n]{0,80}/im;
const SIGN_OFF =
  /(?:^|\n)(?:thanks|thank you|best|best regards|cheers|regards|sincerely)[^\n]{0,80}\s*$/im;
const SENTENCE_SPLIT = /[.!?]+/;
const FIRST_PERSON = /\b(?:i|i'm|i've|we|we're|our)\b/gi;
const WORD_SPLIT = /\s+/;

export function buildToneProfile(samples: readonly ToneSample[]): ToneProfile {
  const bodies = samples.map((sample) => sample.body.trim()).filter(Boolean);
  const greetings = bodies
    .map((body) => GREETING.exec(body)?.[0]?.trim() ?? null)
    .filter((value): value is string => Boolean(value));
  const signOffs = bodies
    .map((body) => SIGN_OFF.exec(body)?.[0]?.trim() ?? null)
    .filter((value): value is string => Boolean(value));

  const sentences = bodies.flatMap((body) =>
    body
      .split(SENTENCE_SPLIT)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.split(WORD_SPLIT).filter(Boolean).length > 2),
  );
  const sentenceLengths = sentences.map(
    (sentence) => sentence.split(WORD_SPLIT).filter(Boolean).length,
  );
  const averageSentenceLength =
    sentenceLengths.length === 0
      ? 0
      : Math.round(
          sentenceLengths.reduce((sum, length) => sum + length, 0) /
            sentenceLengths.length,
        );

  const firstPersonHits = bodies.reduce((count, body) => {
    return count + (body.match(FIRST_PERSON)?.length ?? 0);
  }, 0);
  const totalWords = bodies.reduce((count, body) => {
    return count + body.split(WORD_SPLIT).filter(Boolean).length;
  }, 0);
  const firstPersonRate =
    totalWords === 0 ? 0 : Number((firstPersonHits / totalWords).toFixed(3));

  const greeting = mostCommon(greetings);
  const signOff = mostCommon(signOffs);
  const brief = [
    greeting ? `Open like "${greeting}".` : "Keep the opening short and direct.",
    signOff ? `Close like "${signOff}".` : "Close briefly without a flourish.",
    averageSentenceLength > 0
      ? `Aim for about ${averageSentenceLength} words per sentence.`
      : "Keep sentences short.",
    firstPersonRate >= 0.04
      ? "Use first person the way the sent folder does."
      : "Stay a little more formal than casual chat.",
    "Match the sent-folder voice. Do not invent a new persona.",
  ].join(" ");

  return {
    sampleCount: samples.length,
    greeting,
    signOff,
    averageSentenceLength,
    firstPersonRate,
    brief,
  };
}

function mostCommon(values: readonly string[]): string | null {
  if (values.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();
  for (const value of values) {
    const key = value.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let winner = values[0] ?? null;
  let winnerCount = 0;
  for (const value of values) {
    const count = counts.get(value.toLowerCase()) ?? 0;
    if (count > winnerCount) {
      winner = value;
      winnerCount = count;
    }
  }
  return winner;
}
