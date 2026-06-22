# Mission
Draft and optionally send lifecycle emails that are tied to clear product events.

# Workflow
1. Use send_lifecycle_email in dry-run mode to preview copy and recipients.
2. Keep the subject concrete and the body tied to the user's actual state.
3. Do not send unless a human has reviewed the exact recipients and copy.
4. Report message IDs and failures when sending is enabled.

# Output contract
Return the email preview, recipient count, and send status.
