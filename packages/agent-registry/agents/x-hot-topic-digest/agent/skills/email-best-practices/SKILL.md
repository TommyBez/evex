---
description: Use when composing or sending the X hot topic digest email through Resend — idempotent sends, deliverability, and accessible HTML for the digest.
---

Apply email best practices to every digest produced by this agent. The digest is a
transactional, scheduled email sent through `send_digest_email` (Resend). It must be
delivered once, readable by assistive tech and AI clients, and traceable to real
sources.

Load this skill before calling `send_digest_email` or whenever the digest HTML is being
drafted.

## Sending the digest

- Always call `preview_digest_email` first to review recipients, sender, subject, and HTML.
- Recipients and sender are configuration-only (`X_HOT_TOPIC_DIGEST_TO` /
  `X_HOT_TOPIC_DIGEST_FROM`). The send tool does not accept `to` or `from` overrides, so
  untrusted X post content cannot redirect the digest to arbitrary addresses.
- Send only through `send_digest_email` with `confirmSend: true` and a stable
  `idempotencyKey` derived from the digest date (for example
  `x-hot-topic-digest-2026-06-26`). Never reuse a key across different digests, and never
  generate a fresh random key per retry attempt — the same logical send must reuse the
  same key so a replayed step does not duplicate the email.
- The `X_HOT_TOPIC_DIGEST_FROM` sender must be a Resend-verified domain. Unverified
  senders are the most common cause of bounces and spam filtering.
- Do not invent recipients. `X_HOT_TOPIC_DIGEST_TO` is the source of truth; if it is
  empty, stop and report the missing configuration instead of sending.
- Resend returns an `error` (rather than throwing) when a send fails — for an unverified
  sender, invalid recipient, rate limit, or validation error. `send_digest_email`
  surfaces this as `sent: false` with the error details and does not cache failed sends,
  so a failed digest can be retried with the same idempotency key. Treat `sent: false` as
  not delivered and report the error.

See [sending-reliability](./references/sending-reliability.md) for the full idempotency
and retry model.

## Composing the digest HTML

- Set `lang` and `dir` on `<html>` and on `<body>`'s direct children.
- Include a `<title>` that names the digest (for example "X Hot Topic Digest — 2026-06-26").
- Use one `<h1>` for the digest title, then nest `<h2>`/`<h3>` in order per topic and
  section. Never skip heading levels or fake headings with bold text.
- Layout tables must carry `role="presentation"`.
- Every link must have discernible text that describes its destination. X post links use
  the handle and a short snippet (for example "vercel on X: We just shipped AI SDK 5");
  Parallel source links use the source title. Never use "click here", bare URLs, or
  linked images with empty alt.
- Body text must pass 4.5:1 contrast and stay readable in dark mode.
- Keep a plain-text alternative alongside the HTML.

See [accessibility](./references/accessibility.md) for the full checklist.

## Source integrity

Every citation in the digest (X post, Parallel result) must come from a tool result.
Do not fabricate URLs, excerpts, or post ids. If a topic cannot be researched, omit it
rather than invent sources.
