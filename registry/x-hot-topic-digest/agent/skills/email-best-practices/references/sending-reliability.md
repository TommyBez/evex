# Sending Reliability

Ensuring an email is sent exactly once and that failures are handled gracefully.

## Idempotency

Prevent duplicate emails when retrying failed requests.

### The problem

Network issues, timeouts, or server errors can leave you uncertain whether an email was
sent. Retrying without idempotency risks sending duplicates.

### Solution: idempotency keys

Send a unique key with each request. If the same key is sent again, the provider returns
the original response instead of sending another email. Resend accepts this as the
`Idempotency-Key` header.

```typescript
// Deterministic key based on the business event
const idempotencyKey = `password-reset-${userId}-${resetRequestId}`;

await resend.emails.send(
  {
    from: 'noreply@example.com',
    to: user.email,
    subject: 'Reset your password',
    html: emailHtml,
  },
  { idempotencyKey },
);
```

### Key generation strategies

| Strategy | Example | Use when |
|----------|---------|----------|
| Event-based (recommended) | `order-confirm-${orderId}` | One email per event |
| Request-scoped | `reset-${userId}-${resetRequestId}` | Retries within same request |
| UUID | `crypto.randomUUID()` | No natural key (generate once, reuse on retry) |

**Best practice:** use deterministic keys based on the business event. If you retry the
same logical send, the same key must be regenerated. Avoid `Date.now()` or random values
generated fresh on each attempt.

**Key expiration:** idempotency keys are typically cached for 24 hours. Retries within
this window return the original response. After expiration, the same key triggers a new
send — so complete retry logic well within 24 hours.

## Result shape: check `error`, don't rely on throws

Email APIs such as Resend resolve `send` with `{ data, error }` rather than throwing on
failure. An unverified sender, invalid recipient, rate limit, or validation error comes
back as an `error` result, not an exception.

```typescript
const { data, error } = await resend.emails.send(emailPayload, { idempotencyKey });

if (error) {
  // Not delivered. Do not cache as success; the same key can be retried.
  return { sent: false, error: { message: error.message, name: error.name } };
}

// Only successful sends are safe to short-circuit on replay.
return { sent: true, messageId: data?.id };
```

A failed send must not be cached as a success. Only successful sends should be
short-circuited on replay; failures need to be retried with the same idempotency key.

## Retry logic

Handle transient failures with exponential backoff.

| Error type | Retry? | Notes |
|------------|--------|-------|
| 5xx (server error) | Yes | Transient, likely to resolve |
| 429 (rate limit) | Yes | Wait for the rate limit window |
| 4xx (client error) | No | Fix the request first |
| Network timeout | Yes | Transient |
| DNS failure | Yes | May be transient |

```typescript
async function sendWithRetry(emailData, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data, error } = await resend.emails.send(emailData);
    if (!error) return data;

    if (isRetryable(error) || attempt < maxRetries - 1) {
      const delay = Math.min(1000 * 2 ** attempt, 30000);
      await sleep(delay + Math.random() * 1000); // jitter
      continue;
    }
    throw error;
  }
}
```

Backoff schedule: 1s → 2s → 4s → 8s, with jitter to prevent thundering herd.

## Timeouts

Set appropriate timeouts to avoid hanging requests. 10–30 seconds is reasonable for
email API calls.

## Related

- [Accessibility](./accessibility.md) — composing the HTML body
