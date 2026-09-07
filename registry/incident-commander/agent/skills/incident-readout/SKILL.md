---
name: incident-readout
description: Draft an incident timeline and next actions from pasted status notes. Use when an operator pastes incident notes or asks for a commander readout.
---

# Incident readout

Draft only from the status notes the operator pasted. Do not invent times,
systems, or impact.

## Steps

1. Sort the notes into a chronological timeline.
2. List next actions a human can take. Call out missing facts.
3. Call `draft_incident_readout` once with the timeline, actions, and a short
   notes summary.
4. Optionally `write_file` the draft for the operator to copy without asking.
   A file write is not a page or a notification.
5. Finish without `ask_question`. Do not park on send, page, or GitHub
   choices.

## Do not

- Page on-call or notify any channel
- Send Slack, email, or SMS
- Open or comment on GitHub issues or pull requests
- Claim the readout was delivered
- Invent a timeline the notes do not support
