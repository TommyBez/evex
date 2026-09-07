/**
 * True when a readout reply claims paging, notification, or a GitHub action.
 * Negated phrasing does not count as a notify claim.
 */
export function replyClaimsNotify(reply: string): boolean {
  const claimsGithub =
    /\bopened (a )?(PR|pull request|issue)\b/i.test(reply) ||
    /\bpublished (a )?PR review\b/i.test(reply);
  if (claimsGithub) {
    return true;
  }

  const claimsNotify =
    /\bpaged (on-call|the on-call|the team|someone)\b/i.test(reply) ||
    /\bnotified (the )?(team|channel|on-call|stakeholders)\b/i.test(reply) ||
    /\bsent (it|the (page|page-out|readout|update|message))\b/i.test(reply) ||
    /\bposted (it|the readout) to slack\b/i.test(reply);
  if (!claimsNotify) {
    return false;
  }

  const negated =
    /\b(do not|don't|won't|cannot|can't|did not|didn't|never)\s+(page|paged|notify|notified|send|sent|post|posted)\b/i.test(
      reply,
    ) ||
    /\bnot (paged|notified|sent)\b/i.test(reply) ||
    /\bno (page|notify|send)\b/i.test(reply);

  return !negated;
}
