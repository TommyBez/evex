---
name: support-reply
description: Draft a customer-facing support reply from product documentation with file-path citations. Use when an operator pastes a customer question or asks for an email or ticket reply draft.
---

# Support reply draft

Draft replies only from product help and support documentation under the
configured `PRODUCT_DOCS_ROOTS` (for example `docs/help`, `docs/support`,
`help`, `support`).

## Steps

1. Call `search_product_docs` with the customer's keywords.
2. Call `read_product_doc` on the best matching paths.
3. Write a customer-facing reply in email or ticket tone and cite every path.
4. Call `draft_support_reply` once with the reply, citations, and whether the
   docs covered the question.
5. Optionally `write_file` the draft for the operator to copy. Do not treat a
   file write as sending.
6. If nothing in-scope answers the question, say the product docs do not cover
   it and still do not invent policy.

## Do not

- Send email or post to a ticket API
- Open or comment on GitHub issues or pull requests
- Claim the draft was delivered
- Invent answers from application source code
