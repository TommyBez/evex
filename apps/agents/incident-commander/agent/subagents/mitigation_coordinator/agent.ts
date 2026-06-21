import { defineAgent } from "eve";

export default defineAgent({
  description: "Turn incident workstreams into an ordered mitigation plan with clear owners, blockers, and escalation points.",
  model: "openai/gpt-5.4",
});
