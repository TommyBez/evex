const NEGATION_BEFORE_ACTION =
  /(?:^|[^A-Za-z])(?:do not|don't|won't|cannot|can't|did not|didn't|never|not)\s+$/i;

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
 * True when a gardener reply claims the docs were published or that a GitHub
 * action happened. Negated phrasing ("did not publish", "never opened a PR")
 * does not count as a publish claim.
 */
export function replyClaimsPublish(reply: string): boolean {
  const claimsGithub =
    hasAffirmativeClaim(reply, /\bopened (a )?(PR|pull request|issue)\b/i) ||
    hasAffirmativeClaim(reply, /\bpublished (a )?PR review\b/i) ||
    hasAffirmativeClaim(reply, /\bmerged (the )?(PR|pull request|update)\b/i);
  if (claimsGithub) {
    return true;
  }

  return (
    hasAffirmativeClaim(
      reply,
      /\bpublished (it|the (docs|update|page|article))\b/i,
    ) ||
    hasAffirmativeClaim(reply, /\bshipped (the )?(docs|update|page)\b/i) ||
    hasAffirmativeClaim(reply, /\bupdated the live (docs|page|article)\b/i)
  );
}
