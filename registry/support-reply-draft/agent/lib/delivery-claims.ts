/**
 * True when a support-draft reply claims the message was delivered or that a
 * GitHub action happened. Negated phrasing ("did not send", "never sent it")
 * does not count as a delivery claim.
 */
export function replyClaimsDelivery(reply: string): boolean {
  const claimsGithub =
    /\bopened (an )?issue\b/i.test(reply) ||
    /\bpublished (a )?PR review\b/i.test(reply);
  if (claimsGithub) {
    return true;
  }

  const claimsSent =
    /\bsent it\b/i.test(reply) ||
    /\bsent (the )?(email|message|reply)\b/i.test(reply) ||
    /\bemailed the customer\b/i.test(reply);
  if (!claimsSent) {
    return false;
  }

  const negatedSent =
    /\b(do not|don't|won't|cannot|can't|did not|didn't|never)\s+(send|sent)\b/i.test(
      reply,
    ) || /\bnot sent\b/i.test(reply);

  return !negatedSent;
}
