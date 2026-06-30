---
name: email-best-practices
description: Send transactional email through Resend with exactly-once delivery, deliverability, and accessible HTML.
---

Guidance for building deliverable, accessible, exactly-once transactional emails sent
through an email API such as Resend. Apply the rules below whenever an email is being
drafted or sent.

## Sending exactly once

Network issues, timeouts, and server errors can leave a send's outcome uncertain.
Retrying without protection duplicates the email. Use an idempotency key: a stable value
derived from the business event, sent with the request, so a retried send with the same
key returns the original outcome instead of issuing a second email.

See [sending-reliability](./references/sending-reliability.md) for the idempotency and
retry model, including key derivation, provider cache windows, and Resend `{ data, error }`
handling.

## Deliverability

The sender domain must be authenticated (SPF/DKIM/DMARC) and the sender address verified
by the provider. Unverified senders are the most common cause of bounces and spam
filtering — Gmail and Yahoo reject unauthenticated email outright.

## Composing accessible HTML

Email must be readable by screen readers, dark-mode clients, translation tools, and AI
clients, not just sighted readers on a default inbox.

- Set `lang` and `dir` on `<html>` and on `<body>`'s direct children (some clients strip
  them from `<html>`).
- Include a `<title>` that names the specific email, not just the brand.
- Use one `<h1>` and nest `<h2>`/`<h3>` in order. Never skip levels or fake headings with
  bold text.
- Layout tables must carry `role="presentation"`.
- Every link must have discernible text that describes its destination — never "click
  here", bare URLs, or linked images with empty alt.
- Meaningful images need descriptive `alt`; decorative images need an explicit `alt=""`.
- Body text must pass 4.5:1 contrast and stay readable in dark mode.
- Send a plain-text alternative alongside the HTML.

See [accessibility](./references/accessibility.md) for the full checklist and priority
order.
