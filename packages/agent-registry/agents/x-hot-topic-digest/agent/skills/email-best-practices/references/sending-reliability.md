# Sending Reliability

Ensuring the digest is sent exactly once and that failures are handled gracefully.

## Idempotency

`send_digest_email` accepts a `confirmSend` flag and an `idempotencyKey`. The key is
forwarded to Resend as the `Idempotency-Key` header, and the tool also keeps an
in-process map of sent keys so a replayed Eve step returns the recorded result instead
of issuing a second send.

### Why it matters

Eve replays a tool step that did not complete. Without idempotency, a retried send
after a timeout would duplicate the digest. With idempotency, the same logical send
reuses the same key and the duplicate is suppressed.

### Key generation

Use a deterministic key based on the digest event. The recommended shape is:

```
x-hot-topic-digest-YYYY-MM-DD
```

| Strategy | Example | Use when |
|----------|---------|----------|
| Digest-date-based (recommended) | `x-hot-topic-digest-2026-06-26` | One digest per day |
| Date + recipient | `x-hot-topic-digest-2026-06-26-ops@example.com` | Per-recipient dedup |

**Do not** generate a fresh random key per retry attempt, and do not use `Date.now()`
or a new UUID on each call. The same logical send must produce the same key.

### Key expiration

Idempotency keys are typically cached for 24 hours. Replays within this window return
the original response. After expiration the same key triggers a new send, so complete
retries well within 24 hours.

## The two-step send

1. `preview_digest_email` — no side effect. Resolves `from`/`to`/`subject` from
   configuration and returns the exact payload plus an HTML preview. Use it to review
   before any send.
2. `send_digest_email` — the only path that calls Resend. Requires `confirmSend: true`
   and a stable `idempotencyKey`. If `confirmSend` is omitted or false, the tool returns
   `notConfirmed: true` and sends nothing.

Never skip the preview. Never call `send_digest_email` without `confirmSend` and an
idempotency key.

## Error handling

Resend resolves `send` with `{ data, error }` rather than throwing. When `error` is
present, `send_digest_email` returns:

```json
{ "sent": false, "idempotencyKey": "...", "to": [...], "error": { "message": "...", "name": "..." } }
```

Failed sends are **not** cached, so the same `idempotencyKey` can be retried and will
issue a new send once the underlying issue is fixed. Only successful sends are cached and
short-circuited on replay.

Common Resend error cases:

| Cause | Action |
|------|---------|
| Invalid email / missing field | Fix the payload |
| Unauthorized (`RESEND_API_KEY`) | Check the API key |
| Forbidden / unverified domain | Verify the sender domain in Resend |
| Validation error | Fix request data |
| Rate limited | Back off and retry |
| Server error (5xx) | Retry with backoff; the idempotency key makes retry safe |

If `send_digest_email` returns `authRequired: missingEnv RESEND_API_KEY`, stop and
report the missing configuration instead of retrying. Treat `sent: false` as not
delivered and surface the error in the digest output.

## Related

- [Accessibility](./accessibility.md) — composing the HTML body
