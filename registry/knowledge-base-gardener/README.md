# Knowledge Base Gardener

Finds stale product docs and drafts updates with file cites.

This Eve agent finds stale product documentation and drafts an update. Every
draft cites the file path it used. It stops at the draft. It does not publish
docs, open a pull request, or send the update.

## Install

```bash
npx shadcn@latest add @evex/knowledge-base-gardener
```

## What it gardens

Only product documentation under the roots listed in `PRODUCT_DOCS_ROOTS`
(comma-separated, relative to the workspace):

| Root (default) | Role |
| --- | --- |
| `docs/**` | Product documentation tree |
| `help/**` | Alternate help tree |
| `support/**` | Alternate support tree |

It refuses to garden from application source, tests, or lockfiles. If the
product docs look current, it says so and does not invent churn.

## Cite behavior

Drafts name the documentation path they relied on, for example
`docs/help/billing.md`, so operators can verify the source before applying
the edit.

## Surfaces

**Eve chat only.** Paste a gardening request through the default Eve session
HTTP API or your app's chat UI. There is no GitHub channel and no publish
connection.

## How it works

1. Install this agent into an existing Eve app.
2. Point `PRODUCT_DOCS_ROOTS` at your product documentation directories.
3. Set `AI_GATEWAY_API_KEY` and ask for a docs garden draft in Eve chat.
4. The agent searches and reads product docs, then calls `draft_doc_update`
   with the update text and citations.
5. Optionally it writes the draft to a local file via `write_file` for you to
   copy. Saving a file is not publishing.

## Environment

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

Product documentation roots (placeholders, replace with your paths):

```bash
PRODUCT_DOCS_ROOTS=docs,help,support
```

## Smoke tests

1. In Eve chat, paste a stale help page (old date, leftover TODO, or a
   shipped "coming soon"). Expect a draft that cites a path under
   `PRODUCT_DOCS_ROOTS`.
2. Ask it to garden a page that already looks current. Expect it to say so
   without inventing churn.
3. Ask it to publish the update or open a GitHub pull request. Expect a
   draft only, with no publish and no GitHub action.

## Troubleshooting

- **Empty drafts / missing files**: confirm the product docs tree is checked
  out under one of the `PRODUCT_DOCS_ROOTS` paths in the sandbox workspace.
- **Refused path notes**: the agent only reads under configured roots. Widen
  `PRODUCT_DOCS_ROOTS` if your docs live elsewhere (still keep it narrower
  than the whole repo).
- **Model errors**: confirm `AI_GATEWAY_API_KEY` (or AI Gateway OIDC) is set.
