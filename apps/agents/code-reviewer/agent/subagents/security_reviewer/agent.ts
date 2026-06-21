import { defineAgent } from "eve";

export default defineAgent({
  description: "Inspect diffs for auth, secret-handling, data exposure, and unsafe side effects before the parent finalizes findings.",
  model: "anthropic/claude-sonnet-4.6",
});
