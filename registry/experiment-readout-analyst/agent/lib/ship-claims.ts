/**
 * True when a readout reply claims a ship/deploy or a GitHub action.
 * Negated phrasing does not count as a ship claim.
 */
export function replyClaimsShip(reply: string): boolean {
  const claimsGithub =
    /\bopened (a )?(PR|pull request|issue)\b/i.test(reply) ||
    /\bpublished (a )?PR review\b/i.test(reply) ||
    /\bmerged (the )?(PR|pull request|change)\b/i.test(reply);
  if (claimsGithub) {
    return true;
  }

  const claimsShip =
    /\bshipped (it|the (variant|change|winner|code))\b/i.test(reply) ||
    /\bdeployed (it|the (variant|change|winner))\b/i.test(reply) ||
    /\brolled (it|the winner) out\b/i.test(reply);
  if (!claimsShip) {
    return false;
  }

  const negated =
    /\b(do not|don't|won't|cannot|can't|did not|didn't|never)\s+(ship|shipped|deploy|deployed|merge|merged|roll|rolled)\b/i.test(
      reply,
    ) || /\bnot (shipped|deployed|merged)\b/i.test(reply);

  return !negated;
}
