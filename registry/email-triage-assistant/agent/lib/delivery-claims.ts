/**
 * True when a reply claims the mailbox message was sent. Negated phrasing
 * ("did not send", "never sent it") does not count as a delivery claim.
 */
export function replyClaimsDelivery(reply: string): boolean {
  const claimsSent =
    /\bsent it\b/i.test(reply) ||
    /\bsent (the )?(email|message|reply)\b/i.test(reply) ||
    /\bemailed (the )?(customer|sender|thread)\b/i.test(reply) ||
    /\b(smtp|sendmail)\b/i.test(reply);

  if (!claimsSent) {
    return false;
  }

  const negatedSent =
    /\b(do not|don't|won't|cannot|can't|did not|didn't|never)\s+(send|sent)\b/i.test(
      reply,
    ) || /\bnot sent\b/i.test(reply);

  return !negatedSent;
}
