---
name: knowledge-base-garden
description: Find stale product docs and draft file-cited updates. Use when an operator asks to garden docs, refresh a stale page, or draft a documentation update.
---

# Knowledge base garden

Draft updates only from product documentation under the configured
`PRODUCT_DOCS_ROOTS` (for example `docs`, `help`, `support`).

## Steps

1. Call `search_product_docs` with keywords from the request or stale hints
   (dates, versions, TODO, coming soon).
2. Call `read_product_doc` on the best-matching paths.
3. Write a draft update and cite every path.
4. Call `draft_doc_update` once with the update, citations, and why the page
   looks stale.
5. Optionally `write_file` the draft for the operator to copy without asking.
   Do not treat a file write as publishing.
6. If nothing in-scope looks stale, say the cited pages look current.
7. Finish without `ask_question`. Do not park on publish, save, or GitHub
   choices.

## Do not

- Publish or apply the update to live docs
- Open or comment on GitHub issues or pull requests
- Claim the draft was published
- Invent stale findings from application source code
- Call `ask_question` or pause for clarifications about delivery
