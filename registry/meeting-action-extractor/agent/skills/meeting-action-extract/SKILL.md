---
name: meeting-action-extract
description: Read meeting transcripts on disk, extract owners and deadlines, and draft Linear issues for human approval. Use when an operator asks to pull actions from notes or file Linear follow-ups from a transcript.
---

# Meeting action extract

Read transcripts under the configured `MEETING_TRANSCRIPT_ROOTS` (for
example `meetings`, `notes/meetings`, `transcripts`). Draft Linear issues.
Stop for human approval. Never create issues.

## Steps

1. Call `search_meeting_transcripts` with keywords from the request
   (owner names, "TODO", "by Friday", a meeting date).
2. Call `read_meeting_transcript` on the best-matching paths.
3. Pull title, owner, deadline, and a short evidence quote from those files.
4. Call `extract_meeting_actions` once with the structured list.
5. Call `draft_linear_issues` once. It always returns `created` false.
6. Call `create_linear_issues` so a human can approve. That call always
   pauses. Even after approval it never creates issues.
7. If nothing in-scope has an action, say so.

## Do not

- Create, save, or file Linear issues
- Call `save_issue` or any Linear write tool
- Claim the drafts were created
- Invent owners or deadlines that the transcript does not state
- Skip the disk read when a transcript path is in scope
