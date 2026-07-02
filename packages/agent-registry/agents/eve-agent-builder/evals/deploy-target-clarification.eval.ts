import { defineEval } from "eve/evals";

const DEPLOY_TARGET_TOKEN = /preview|production/i;

// The prompt states only the scenario facts. It must not tell the agent which
// tools to avoid or what to ask — that would test prompt-following instead of
// the agent's own instructions.
export default defineEval({
  description:
    "Asks which Vercel project and target to use before running any deploy when the request leaves them unspecified.",
  async test(t) {
    await t.send(`
Deploy it.

Context for this run: the workspace contains one Eve app. Nothing in this session says which Vercel project to use or whether the target is a preview or production deployment, and no local testing has run yet.
`);

    t.notCalledTool("run_vercel_cli");
    // The clarifying question may arrive as assistant text or as an
    // ask_question input request, so match either event shape.
    t.eventsSatisfy("clarifies preview vs production before deploying", (events) =>
      events.some(
        (event) =>
          (event.type === "message.completed" ||
            event.type === "input.requested") &&
          DEPLOY_TARGET_TOKEN.test(JSON.stringify(event))
      )
    );
  },
});
