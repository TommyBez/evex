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
const idempotencyKey = `competitor-intel-monitor-${runDate}`;

await resend.emails.send(
  {
    from: "alerts@example.com",
    to: "ops@example.com",
    subject: "Competitor intel digest",
    html: emailHtml,
    text: emailText,
  },
  { idempotencyKey },
);
```

### Key generation strategies

| Strategy | Example | Use when |
|----------|---------|----------|
| Event-based (recommended) | `competitor-intel-monitor-2026-09-07` | One digest per run date |
| Request-scoped | `competitor-intel-monitor-${runDate}` | Retries within same request |
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
  return { sent: false, error: { message: error.message, name: error.name } };
}

return { sent: true, messageId: data?.id };
```

A failed send must not be cached as a success. Only successful sends should be
short-circuited on replay; failures need to be retried with the same idempotency key.

## Related

- [Accessibility](./accessibility.md) — composing the HTML body
