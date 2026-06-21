import { defineAgent } from "eve";

export default defineAgent({
  description: "Design the smallest high-value regression tests that would validate or falsify the parent reviewer’s concerns.",
  model: "anthropic/claude-sonnet-4.6",
});
