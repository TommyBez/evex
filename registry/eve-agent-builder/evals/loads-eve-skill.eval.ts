import { defineEval } from "eve/evals";

// The instructions require loading the eve skill (bundled-docs pointer) and
// the delivery skill before changing an Eve agent. The prompt states only the
// task; loading the skills is the behavior under test.
export default defineEval({
  description:
    "Loads the eve and eve-agent-delivery skills before starting work that changes an Eve agent.",
  tags: ["skills"],
  timeoutMs: 300_000,
  async test(t) {
    await t.send(`
Add an eval to this Eve app that checks the agent greets the user politely.

Context for this run: the workspace contains one Eve app with an existing
evals/ directory. Do not deploy anything. Stop after the new eval file is
written and report what you created.
`);

    t.loadedSkill("eve");
    t.loadedSkill("eve-agent-delivery");
  },
});
