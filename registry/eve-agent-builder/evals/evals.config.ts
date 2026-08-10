import { defineEvalConfig } from "eve/evals";

export default defineEvalConfig({
  // Default judge for t.judge.* assertions; never the model under test.
  // Judge evals skip visibly when no gateway credential is available.
  judge: {
    model: "openai/gpt-5.4-mini",
  },
  timeoutMs: 180_000,
});
