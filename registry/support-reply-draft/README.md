# Support Reply Draft

Drafts a customer reply from product docs and cites the file.

This Eve agent drafts customer-facing support replies (email or ticket tone)
from product help and support documentation. Every draft cites the file path it
used. It stops at the draft — it does not send mail, post to a ticket API, or
open GitHub issues.

## Install

```bash
npx shadcn@latest add @evex/support-reply-draft
```

## What it drafts from

Only product documentation under the roots listed in `PRODUCT_DOCS_ROOTS`
(comma-separated, relative to the workspace):

| Root (default) | Role |
| --- | --- |
| `docs/help/**` | Product help articles |
| `docs/support/**` | Support / troubleshooting docs |
| `help/**` | Alternate help tree |
| `support/**` | Alternate support tree |

It refuses to answer from application source, tests, or lockfiles. If the
product docs lack an answer, it says so and does not invent policy.

## Cite behavior

Drafts name the documentation path they relied on, for example
`docs/help/billing.md`, so operators can verify the source before sending.

## Surfaces

**Eve chat only** — paste a customer question through the default Eve session
HTTP API or your app's chat UI. There is no GitHub channel and no email-send
connection.

## How it works

1. Install this agent into an existing Eve app.
2. Point `PRODUCT_DOCS_ROOTS` at your product help/support directories.
3. Set `AI_GATEWAY_API_KEY` and ask for a support reply draft in Eve chat.
4. The agent searches and reads product docs, then calls `draft_support_reply`
   with the reply text and citations.
5. Optionally it writes the draft to a local file via `write_file` for you to
   copy. Saving a file is not delivery.

## Environment

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

Product documentation roots (placeholders — replace with your paths):

```bash
PRODUCT_DOCS_ROOTS=docs/help,docs/support,help,support
```

## Smoke tests

1. In Eve chat, paste a customer billing or setup question that your help docs
   cover — expect a draft that cites a path under `PRODUCT_DOCS_ROOTS`.
2. Ask something the product docs do not cover — expect an explicit “not in
   the docs” reply with no invented policy.
3. Ask it to send the reply or open a GitHub issue — expect a draft only, with
   no send and no GitHub action.

## Troubleshooting

- **Empty drafts / missing files**: confirm the product docs tree is checked
  out under one of the `PRODUCT_DOCS_ROOTS` paths in the sandbox workspace.
- **Refused path notes**: the agent only reads under configured roots. Widen
  `PRODUCT_DOCS_ROOTS` if your help docs live elsewhere (still keep it narrower
  than the whole repo).
- **Model errors**: confirm `AI_GATEWAY_API_KEY` (or AI Gateway OIDC) is set.
