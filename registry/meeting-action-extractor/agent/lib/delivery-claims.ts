const NEGATION_BEFORE_ACTION =
  /(?:^|[^A-Za-z])(?:do not|don't|won't|cannot|can't|did not|didn't|never|not)(?:\s+(?:actually|really|even))?\s+$/i;

function hasAffirmativeClaim(reply: string, pattern: RegExp): boolean {
  const globalPattern = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
  );
  for (const match of reply.matchAll(globalPattern)) {
    const before = reply.slice(0, match.index ?? 0);
    if (!NEGATION_BEFORE_ACTION.test(before)) {
      return true;
    }
  }
  return false;
}

/**
 * True when a reply claims Linear issues were created. Negated phrasing
 * ("did not create", "never opened issues") does not count.
 */
export function replyClaimsLinearCreate(reply: string): boolean {
  return (
    hasAffirmativeClaim(
      reply,
      /\bcreated (the )?(Linear )?(issues?|tickets?|follow-?ups?)\b/i,
    ) ||
    hasAffirmativeClaim(reply, /\bopened (the )?(Linear )?(issues?|tickets?)\b/i) ||
    hasAffirmativeClaim(reply, /\bsaved (the )?(issues?|tickets?) (to|in) Linear\b/i) ||
    hasAffirmativeClaim(reply, /\bfiled (the )?(Linear )?(issues?|tickets?)\b/i) ||
    hasAffirmativeClaim(
      reply,
      /\b(the )?(Linear )?(issues?|tickets?|follow-?ups?) (were|have been) (created|filed|opened|saved)\b/i,
    ) ||
    hasAffirmativeClaim(
      reply,
      /\badded (the )?(Linear )?(issues?|tickets?|follow-?ups?) (to|in) Linear\b/i,
    )
  );
}
