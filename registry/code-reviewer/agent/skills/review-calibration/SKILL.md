---
name: review-calibration
description: Calibrate review severity when impact is ambiguous and the review needs a consistent bar.
---

# Review calibration

**Calibrate** each finding against user harm, exploitability, reversibility, and
detection speed. Escalate issues that can corrupt state, leak data, bypass
authorization, or silently ship broken behavior. De-escalate issues that are
recoverable, obvious, and tightly scoped.

Use the review tool severity labels:

- **blocking** — probable bugs, security issues, data loss, broken runtime
  behavior, or user-visible regressions
- **warning** — real risks that depend on runtime context, rollout conditions,
  or materially missing tests
- **nit** — small correctness improvements only; never style

For severity lenses and review checklist detail, see
[severity-scale](./references/severity-scale.md) and
[review-checklist](./references/review-checklist.md).
