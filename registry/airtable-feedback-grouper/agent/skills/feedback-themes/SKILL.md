---
name: feedback-themes
description: Cluster pasted Airtable feedback into themes with example quotes. Use when an operator pastes exported rows or asks to group feedback.
---

# Feedback themes

Draft only from the pasted or exported feedback. Do not invent quotes.

## Steps

1. Read the rows the operator pasted.
2. Group them into themes. Keep short example quotes from the input.
3. Call `draft_feedback_themes` once with the themes, quotes, and row count.
4. Optionally `write_file` the draft for the operator to copy without asking.
   A file write is not an Airtable write.
5. Finish without `ask_question`. Do not park on Airtable write or GitHub
   choices.

## Do not

- Write or update Airtable records
- Ask for an Airtable API token
- Open or comment on GitHub issues or pull requests
- Invent quotes that are not in the paste
- Claim the themes were saved to Airtable
