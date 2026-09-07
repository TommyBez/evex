/**
 * True when a themes reply claims an Airtable write or a GitHub action.
 * Negated phrasing does not count as a write claim.
 */
export function replyClaimsAirtableWrite(reply: string): boolean {
  const claimsGithub =
    /\bopened (a )?(PR|pull request|issue)\b/i.test(reply) ||
    /\bpublished (a )?PR review\b/i.test(reply);
  if (claimsGithub) {
    return true;
  }

  const claimsWrite =
    /\bwrote (them|it|the themes) (back )?to airtable\b/i.test(reply) ||
    /\bupdated (the )?(airtable|records|base)\b/i.test(reply) ||
    /\bcreated (a )?(view|records?) in airtable\b/i.test(reply);
  if (!claimsWrite) {
    return false;
  }

  const negated =
    /\b(do not|don't|won't|cannot|can't|did not|didn't|never)\s+(write|wrote|update|updated|create|created)\b/i.test(
      reply,
    ) || /\bnot (written|updated)\b/i.test(reply);

  return !negated;
}
