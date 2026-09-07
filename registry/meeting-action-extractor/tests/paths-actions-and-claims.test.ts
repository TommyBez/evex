import { describe, expect, it } from "vitest";

import { replyClaimsLinearCreate } from "../agent/lib/delivery-claims";
import {
  needsLinearWriteApproval,
  normalizeLinearToolName,
} from "../agent/lib/linear-connection";
import {
  buildLinearIssueDrafts,
  refuseLinearCreate,
  toDraftedIssuesModelValue,
} from "../agent/lib/linear-issue-drafts";
import {
  normalizeDeadline,
  normalizeOwner,
  toExtractedActionsModelValue,
  validateMeetingAction,
  validateMeetingActions,
} from "../agent/lib/meeting-actions";
import {
  DEFAULT_MEETING_TRANSCRIPT_ROOTS,
  isAllowedMeetingTranscriptPath,
  meetingTranscriptRootsFromEnv,
  normalizeMeetingTranscriptPath,
  parseMeetingTranscriptSearchHitLine,
} from "../agent/lib/meeting-transcript-paths";

describe("normalizeMeetingTranscriptPath / MEETING_TRANSCRIPT_ROOTS", () => {
  it("strips trailing slashes from roots so child paths still match", () => {
    expect(normalizeMeetingTranscriptPath("meetings/")).toBe("meetings");
    expect(normalizeMeetingTranscriptPath("meetings//")).toBe("meetings");

    const roots = meetingTranscriptRootsFromEnv("meetings/,transcripts/");
    expect(roots).toEqual(["meetings", "transcripts"]);
    expect(
      isAllowedMeetingTranscriptPath("meetings/standup-2026-09-07.md", roots),
    ).toBe(true);
    expect(
      isAllowedMeetingTranscriptPath("meetings/standup-2026-09-07.md", [
        "meetings/",
      ]),
    ).toBe(true);
  });

  it("refuses paths outside the configured transcript roots", () => {
    const roots = DEFAULT_MEETING_TRANSCRIPT_ROOTS;
    expect(isAllowedMeetingTranscriptPath("apps/web/page.tsx", roots)).toBe(
      false,
    );
    expect(isAllowedMeetingTranscriptPath("docs/help.md", roots)).toBe(false);
    expect(
      isAllowedMeetingTranscriptPath("../meetings/secret.md", roots),
    ).toBe(false);
  });
});

describe("parseMeetingTranscriptSearchHitLine", () => {
  it("parses path:line:text from rg -n -H output", () => {
    expect(
      parseMeetingTranscriptSearchHitLine(
        "meetings/standup-2026-09-07.md:4:Ava will ship refunds",
      ),
    ).toEqual({
      path: "meetings/standup-2026-09-07.md",
      line: 4,
      text: "Ava will ship refunds",
    });
  });

  it("drops bare line:text (single-file rg without -H)", () => {
    expect(
      parseMeetingTranscriptSearchHitLine("4:Ava will ship refunds"),
    ).toBeNull();
  });
});

describe("meeting action validation", () => {
  const roots = DEFAULT_MEETING_TRANSCRIPT_ROOTS;

  it("normalizes owners and ISO deadlines", () => {
    expect(normalizeOwner(" Ava ")).toBe("Ava");
    expect(normalizeOwner("TBD")).toBe("unassigned");
    expect(normalizeDeadline("2026-09-12")).toBe("2026-09-12");
    expect(normalizeDeadline(" Friday ")).toBe("Friday");
    expect(normalizeDeadline("")).toBeNull();
  });

  it("accepts an in-scope transcript action", () => {
    const decision = validateMeetingAction(
      {
        title: "Ship billing refund window",
        owner: "Ava",
        deadline: "2026-09-12",
        sourcePath: "meetings/standup-2026-09-07.md",
        evidence: "Ava: I will ship the billing refund window by 2026-09-12.",
      },
      roots,
    );
    expect(decision.ok).toBe(true);
    if (decision.ok) {
      expect(decision.action.owner).toBe("Ava");
      expect(decision.action.deadline).toBe("2026-09-12");
      const modelValue = toExtractedActionsModelValue([decision.action]);
      expect(modelValue.actions[0]).toEqual(decision.action);
      expect(modelValue.actions[0]?.evidence).toBe(
        "Ava: I will ship the billing refund window by 2026-09-12.",
      );
    }
  });

  it("rejects actions that cite application source", () => {
    const result = validateMeetingActions(
      [
        {
          title: "Ship billing refund window",
          owner: "Ava",
          deadline: "2026-09-12",
          sourcePath: "apps/web/page.tsx",
          evidence: "Ava will ship refunds",
        },
      ],
      roots,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejectedPaths).toContain("apps/web/page.tsx");
    }
  });
});

describe("Linear drafts never create", () => {
  it("builds payloads with created false", () => {
    const bundle = buildLinearIssueDrafts([
      {
        title: "Ship billing refund window",
        owner: "Ava",
        deadline: "2026-09-12",
        sourcePath: "meetings/standup-2026-09-07.md",
        evidence: "Ava: I will ship the billing refund window by 2026-09-12.",
      },
    ]);
    expect(bundle.created).toBe(false);
    expect(bundle.awaitingApproval).toBe(true);
    expect(bundle.issues[0]?.assigneeName).toBe("Ava");
    expect(bundle.issues[0]?.dueDate).toBe("2026-09-12");
  });

  it("keeps env-derived team fields on the model-facing draft payload", () => {
    const previousTeamId = process.env.LINEAR_TEAM_ID;
    const previousTeamKey = process.env.LINEAR_TEAM_KEY;
    process.env.LINEAR_TEAM_ID = "team-123";
    process.env.LINEAR_TEAM_KEY = "ENG";

    try {
      const action = {
        title: "Ship billing refund window",
        owner: "Ava",
        deadline: "2026-09-12",
        sourcePath: "meetings/standup-2026-09-07.md",
        evidence: "Ava: I will ship the billing refund window by 2026-09-12.",
      };
      const bundle = buildLinearIssueDrafts([action]);
      const modelValue = toDraftedIssuesModelValue(bundle.issues);

      expect(modelValue.issues).toEqual(bundle.issues);
      expect(modelValue.issues[0]).toMatchObject({
        title: action.title,
        description: expect.stringContaining(action.evidence),
        teamId: "team-123",
        teamKey: "ENG",
        assigneeName: "Ava",
        dueDate: "2026-09-12",
        sourcePath: action.sourcePath,
      });
    } finally {
      if (previousTeamId === undefined) {
        delete process.env.LINEAR_TEAM_ID;
      } else {
        process.env.LINEAR_TEAM_ID = previousTeamId;
      }
      if (previousTeamKey === undefined) {
        delete process.env.LINEAR_TEAM_KEY;
      } else {
        process.env.LINEAR_TEAM_KEY = previousTeamKey;
      }
    }
  });

  it("keeps created false after human approval", () => {
    const refused = refuseLinearCreate(
      [
        {
          title: "Ship billing refund window",
          description: "Draft",
          teamId: null,
          teamKey: null,
          assigneeName: "Ava",
          dueDate: "2026-09-12",
          sourcePath: "meetings/standup-2026-09-07.md",
        },
      ],
      true,
    );
    expect(refused.approved).toBe(true);
    expect(refused.created).toBe(false);
  });
});

describe("Linear connection write approval", () => {
  it("lets reads through and gates writes", () => {
    expect(normalizeLinearToolName("linear__list_issues")).toBe("list_issues");
    expect(needsLinearWriteApproval("linear__list_issues")).toBe(false);
    expect(needsLinearWriteApproval("linear__save_issue")).toBe(true);
    expect(needsLinearWriteApproval("save_issue")).toBe(true);
  });
});

describe("replyClaimsLinearCreate", () => {
  it("matches short create claims", () => {
    expect(replyClaimsLinearCreate("Done. I created the Linear issues.")).toBe(
      true,
    );
    expect(replyClaimsLinearCreate("I opened the Linear tickets.")).toBe(true);
  });

  it("matches passive and alternative create claims", () => {
    expect(replyClaimsLinearCreate("The Linear issues were created")).toBe(true);
    expect(replyClaimsLinearCreate("I added the tickets to Linear")).toBe(true);
  });

  it("does not treat negated statements as create claims", () => {
    expect(
      replyClaimsLinearCreate("I drafted the issues and did not create them."),
    ).toBe(false);
    expect(replyClaimsLinearCreate("I will not create the Linear issues.")).toBe(
      false,
    );
    expect(replyClaimsLinearCreate("Draft only. never created the issues.")).toBe(
      false,
    );
    expect(
      replyClaimsLinearCreate("I never actually opened the Linear tickets."),
    ).toBe(false);
  });
});
