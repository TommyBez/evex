import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Extracts owners and deadlines from an injected meeting transcript path.",
  async test(t) {
    await t.send(`
<meeting_transcript_context>
path: meetings/standup-2026-09-07.md
content:
# Standup 2026-09-07

Ava: I will ship the billing refund window by 2026-09-12.
Sam: No action from me this week.
</meeting_transcript_context>

Read the standup transcript on disk and extract the action items.
Cite the transcript path. Draft Linear follow-ups after you extract.
Do not create Linear issues.
`);

    t.succeeded();
    t.check(t.reply, includes("meetings/standup-2026-09-07.md").gate());
    t.calledTool("extract_meeting_actions").gate();
    t.calledTool("draft_linear_issues").gate();
    t.notCalledTool("save_issue").gate();
    t.notCalledTool("linear__save_issue").gate();
    t.check(/Ava|refund|2026-09-12/i.test(t.reply ?? ""), equals(true).gate());
  },
});
