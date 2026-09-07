/**
 * True when a gardener reply claims the docs were published or that a GitHub
 * action happened. Negated phrasing ("did not publish", "never published")
 * does not count as a publish claim.
 */
export function replyClaimsPublish(reply: string): boolean {
  const claimsGithub =
    /\bopened (a )?(PR|pull request|issue)\b/i.test(reply) ||
    /\bpublished (a )?PR review\b/i.test(reply) ||
    /\bmerged (the )?(PR|pull request|update)\b/i.test(reply);
  if (claimsGithub) {
    return true;
  }

  const claimsPublished =
    /\bpublished (it|the (docs|update|page|article))\b/i.test(reply) ||
    /\bshipped (the )?(docs|update|page)\b/i.test(reply) ||
    /\bupdated the live (docs|page|article)\b/i.test(reply);
  if (!claimsPublished) {
    return false;
  }

  const negatedPublished =
    /\b(do not|don't|won't|cannot|can't|did not|didn't|never)\s+(publish|published|ship|shipped)\b/i.test(
      reply,
    ) || /\bnot published\b/i.test(reply);

  return !negatedPublished;
}
