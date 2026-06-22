Use when the diff touches auth, secrets, user data, integrations, or external side effects.

Walk every trust boundary:
- who can trigger the code path
- what data crosses the boundary
- what authorization gate exists
- what side effect can happen if the guard fails
