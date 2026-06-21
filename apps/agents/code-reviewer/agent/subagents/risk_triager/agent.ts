import { defineAgent } from "eve";

export default defineAgent({
  description: "Rank changed files by review risk and propose the best reading order before the parent writes findings.",
  model: "anthropic/claude-sonnet-4.6",
});
