const DELIVERY_CLAIM =
  /\bsent it\b|\bsent (the )?(email|message|reply)\b|\bemailed (the )?(customer|sender|thread)\b|\b(smtp|sendmail)\b/gi;
const LOCAL_NEGATION_PREFIX =
  /\b(do not|don't|won't|cannot|can't|did not|didn't|never|not)\s+$/i;

/**
 * True when a reply claims the mailbox message was sent. Negation is
 * evaluated against the same local delivery phrase, not the whole reply.
 */
export function replyClaimsDelivery(reply: string): boolean {
  for (const match of reply.matchAll(DELIVERY_CLAIM)) {
    const index = match.index ?? 0;
    const prefix = reply.slice(Math.max(0, index - 24), index);
    if (!LOCAL_NEGATION_PREFIX.test(prefix)) {
      return true;
    }
  }
  return false;
}
