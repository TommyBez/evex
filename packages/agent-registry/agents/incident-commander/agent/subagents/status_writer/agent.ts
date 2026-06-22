import { defineAgent } from "eve";

export default defineAgent({
  description: "Draft high-clarity incident updates for stakeholders, executives, or customers without changing the underlying facts.",
  model: "openai/gpt-5.4",
});
