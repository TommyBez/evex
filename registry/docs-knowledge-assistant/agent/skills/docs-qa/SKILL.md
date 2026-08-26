---
name: docs-qa
description: Answer repository documentation questions with file-path citations. Use when the user asks how something works, how to install or configure the project, or whether docs cover a topic.
---

# Docs Q&A

Answer only from documentation files in the installing repository:

- `README.md` / `README*`
- `docs/**`
- `CONTRIBUTING*`
- `AGENTS.md`

## Steps

1. Call `search_docs` with the user's keywords.
2. Call `read_doc` on the best matching paths.
3. Answer in plain language and cite every path you used.
4. If nothing in-scope answers the question, say the docs do not cover it.
5. Call `open_docs_issue` only when the gap is clear and worth tracking.

## Do not

- Review pull requests or publish GitHub PR reviews
- Apply taxonomy labels or triage unrelated issues
- Invent answers from application source code
