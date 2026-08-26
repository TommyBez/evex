# Docs Knowledge Assistant

Answers from your repo docs and cites the file.

This eve agent answers questions from the installing repository's documentation
(`README`, `docs/`, `CONTRIBUTING*`, `AGENTS.md`) on Eve chat and GitHub issue
comments. Every answer cites the file path it used. It is not a pull request
reviewer and does not label or triage issues.

## Install

```bash
npx shadcn@latest add @evex/docs-knowledge-assistant
```

## What it answers from

Only documentation files in the checked-out repository:

| Path | Role |
| --- | --- |
| `README.md` / `README*` | Project overview and quick start |
| `docs/**` | Product and contributor docs |
| `CONTRIBUTING*` | Contribution guides |
| `AGENTS.md` | Agent / contributor operating notes |

It refuses to answer from application source, tests, or config when the docs do
not cover the question. If the docs lack an answer, it says so. When the gap is
clear, it can open a documentation issue with `open_docs_issue` (create-issue
only — no taxonomy labels).

## Cite behavior

Answers name the documentation path they relied on, for example `README.md` or
`docs/install.md`, so readers can verify the source.

## Surfaces

1. **Eve chat** — ask questions through the default Eve session HTTP API or your
   app's chat UI.
2. **GitHub issue comments** — mention `@docs-knowledge-assistant` (or your
   `GITHUB_APP_SLUG`) on an issue. The agent replies in the issue thread.

Pull request conversations and review threads are ignored. This agent never
publishes GitHub PR reviews. Use `@evex/code-reviewer` for PR review and
`@evex/github-issue-maintainer` for issue labeling.

## How it works

1. Install this agent into an existing Eve app.
2. For chat-only use, set `AI_GATEWAY_API_KEY` and ask documentation questions.
3. For GitHub issue Q&A, deploy over HTTPS, create a GitHub App, and point the
   webhook at `/eve/v1/github`.
4. Subscribe to **Issue comments** (Issues write is needed only if you want
   `open_docs_issue` to create docs-gap issues).
5. Mention the bot on an issue with a documentation question.

## GitHub App setup (optional)

Create the GitHub App from **GitHub Settings -> Developer settings ->
GitHub Apps -> New GitHub App**.

- **GitHub App name**: `docs-knowledge-assistant`, or another name that matches
  `GITHUB_APP_SLUG`.
- **Webhook URL**: `https://<your-eve-deployment>/eve/v1/github`.
- **Webhook secret**: save as `GITHUB_WEBHOOK_SECRET`.

### Permissions

- Metadata: read
- Contents: read (sandbox checkout for documentation files)
- Issues: read/write (comment replies; create docs-gap issues only)

Do **not** grant Pull requests write.

### Events

Subscribe to **Issue comments**. You do not need pull request review events.

## Environment

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

Optional GitHub App credentials for issue-comment Q&A:

```bash
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_SLUG=docs-knowledge-assistant
```

## Smoke tests

1. In Eve chat, ask how to install the project — expect an answer that cites
   `README.md` or a docs path.
2. Ask something the docs do not cover — expect an explicit “not in the docs”
   reply, optionally with `open_docs_issue`.
3. Mention the bot on a pull request — expect no review and no labels.

## Troubleshooting

- **Empty answers / missing files**: confirm the repository is checked out into
  the sandbox (GitHub channel) or that local chat has the docs tree under
  `/workspace`.
- **HTTP 401 on `/eve/v1/github`**: webhook secret mismatch.
- **No reply on issues**: confirm Issue comments is subscribed and the mention
  matches `GITHUB_APP_SLUG`.
