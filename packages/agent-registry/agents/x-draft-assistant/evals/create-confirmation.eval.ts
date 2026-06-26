import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Confirms the create path requires confirmCreate=true and a stable, unique idempotencyKey per draft, that madeWithAi/socialSetId/tag are never passed as tool input (they come from config), and that the reply mentions the X made-with-AI disclosure.",
  async test(t) {
    const turn = await t.send(`
The three X draft candidates have been previewed with preview_x_draft and the user has approved creating them in Typefully. The scan_x_profiles run for this batch reported windowStart=2026-06-26T08:00:00Z.

Now create the drafts with create_x_drafts. Use the lookback window start and the candidate index to build a stable, unique idempotencyKey per draft such as x-draft-assistant-2026-06-26T08:00:00Z-1, x-draft-assistant-2026-06-26T08:00:00Z-2, and x-draft-assistant-2026-06-26T08:00:00Z-3. Set confirmCreate=true. If you would otherwise create without confirmCreate=true, do not create and report that confirmation is required instead.
`);

    const call = turn.requireToolCall("create_x_drafts");
    t.check(call.input.confirmCreate, equals(true).gate());
    const drafts = call.input.drafts as readonly { idempotencyKey?: string }[];
    t.check(drafts.length === 3, equals(true).gate());
    const keys = new Set<string>();
    let allKeysUnique = true;
    for (const draft of drafts) {
      const key = draft.idempotencyKey;
      if (typeof key !== "string" || key.length === 0 || keys.has(key)) {
        allKeysUnique = false;
      }
      keys.add(key ?? "");
    }
    t.check(allKeysUnique, equals(true).gate());
    t.check(call.input.socialSetId === undefined, equals(true).soft());
    t.check(call.input.tag === undefined, equals(true).soft());
    t.check(call.input.madeWithAi === undefined, equals(true).soft());
    t.check(t.reply, includes("x-draft-assistant-2026-06-26T08:00:00Z-1").soft());
    const replyLower = (t.reply ?? "").toLowerCase();
    t.check(replyLower, includes("made with ai").soft());
  },
});
