import { defineTool } from "eve/tools";
import { z } from "zod";

import { isCalendarDate } from "../lib/aging";
import {
  buildDeadlineDigest,
  buildDigestIdempotencyKey,
  utcDateStamp,
} from "../lib/digest";
import { rfpResponseConfig } from "../lib/rfp-config";

const upcomingRfpSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  dueDate: z.string().min(1).max(40),
  sourceId: z.string().max(400).optional(),
});

const previewDeadlineDigestInput = z.object({
  rfps: z.array(upcomingRfpSchema).max(50),
  runDate: z.string().min(1).max(10).optional(),
});

export default defineTool({
  description:
    "Preview the optional RFP deadline and aging digest and return the date idempotency key. Does not post Slack, send digest email, write Drive, or submit a portal.",
  inputSchema: previewDeadlineDigestInput,
  execute({ rfps, runDate }) {
    const resolvedDate = runDate ?? utcDateStamp();
    if (!isCalendarDate(resolvedDate)) {
      return {
        ok: false,
        submitted: false,
        sent: false,
        note: "runDate must be a real YYYY-MM-DD calendar date.",
      };
    }
    const draft = buildDeadlineDigest(rfps, {
      runDate: resolvedDate,
      subject: rfpResponseConfig.digestSubject,
    });
    return {
      runDate: resolvedDate,
      idempotencyKey: buildDigestIdempotencyKey(resolvedDate),
      subject: draft.subject,
      slackText: draft.slackText,
      text: draft.text,
      html: draft.html,
      aging: draft.aging,
      upcomingCount: draft.upcomingCount,
      submitted: false,
      sent: false,
    };
  },
});
