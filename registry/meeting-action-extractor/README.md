# Meeting Action Extractor

Pulls meeting notes, extracts owners and deadlines, and drafts Linear follow-ups for approval.

This Eve agent reads meeting transcripts from disk, extracts owners and
deadlines, and drafts Linear issues. A human must approve the drafts. It
never creates Linear issues.

## Install

```bash
npx shadcn@latest add @evex/meeting-action-extractor
```

## What it reads

Only meeting transcripts under the roots listed in
`MEETING_TRANSCRIPT_ROOTS` (comma-separated, relative to the workspace):

| Root (default) | Role |
| --- | --- |
| `meetings/**` | Meeting notes tree |
| `notes/meetings/**` | Nested notes tree |
| `transcripts/**` | Alternate transcript tree |

It refuses application source, tests, and lockfiles. If a transcript does
not name an owner or deadline, the draft keeps that field unassigned.

## Surfaces

**Eve chat.** Paste a request through the default Eve session HTTP API or
your app's chat UI. Linear is a read-only lookup for team and people names
while you draft. There is no Linear write that creates issues.

## How it works

1. Install this agent into an existing Eve app.
2. Point `MEETING_TRANSCRIPT_ROOTS` at your transcript directories.
3. Set `AI_GATEWAY_API_KEY` and ask for actions from a meeting transcript
   in Eve chat.
4. The agent searches and reads files on disk, then calls
   `extract_meeting_actions` and `draft_linear_issues`.
5. `create_linear_issues` pauses for human approval. Even after approval
   it never creates issues. Copy the drafts into Linear yourself.

## Environment

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

Transcript roots (placeholders, replace with your paths):

```bash
MEETING_TRANSCRIPT_ROOTS=meetings,notes/meetings,transcripts
```

Optional Linear draft defaults and a read-only Connect UID:

```bash
LINEAR_TEAM_ID=
LINEAR_TEAM_KEY=
LINEAR_CONNECT_UID=
```

## Smoke tests

1. Put a transcript under `meetings/` with an owner and a deadline. In Eve
   chat, ask for Linear follow-ups. Expect `extract_meeting_actions` and
   `draft_linear_issues`, then a pause on `create_linear_issues`.
2. Ask it to create the Linear issues immediately. Expect drafts and an
   approval pause. Expect no created issues.
3. Point it at a file outside `MEETING_TRANSCRIPT_ROOTS`. Expect a refusal
   note, not invented actions.

## Troubleshooting

- **Empty extracts / missing files**: confirm the transcript tree is
  checked out under one of the `MEETING_TRANSCRIPT_ROOTS` paths in the
  sandbox workspace.
- **Refused path notes**: the agent only reads under configured roots.
  Widen `MEETING_TRANSCRIPT_ROOTS` if notes live elsewhere (still keep it
  narrower than the whole repo).
- **Linear lookup errors**: `LINEAR_CONNECT_UID` is optional for drafting.
  Reads fail closed if the connector is missing; drafts still work.
- **Model errors**: confirm `AI_GATEWAY_API_KEY` (or AI Gateway OIDC) is set.
