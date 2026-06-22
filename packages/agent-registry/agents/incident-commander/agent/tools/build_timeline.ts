import { defineTool } from "eve/tools";
import { differenceInMinutes, parseISO } from "date-fns";
import { z } from "zod";

const incidentEvent = z.object({
  at: z.string().min(1),
  source: z.string().min(1),
  summary: z.string().min(1),
  evidence: z.string().optional(),
});

export default defineTool({
  description: "Sort incident signals into a timeline and highlight suspicious gaps.",
  inputSchema: z.object({
    events: z.array(incidentEvent).min(1),
  }),
  async execute({ events }) {
    const ordered = [...events].sort((left, right) => {
      return parseISO(left.at).getTime() - parseISO(right.at).getTime();
    });

    const gaps = [];
    for (let index = 1; index < ordered.length; index += 1) {
      const previous = ordered[index - 1];
      const current = ordered[index];
      const gapMinutes = differenceInMinutes(
        parseISO(current.at),
        parseISO(previous.at),
      );

      if (gapMinutes >= 20) {
        gaps.push({
          after: previous.at,
          before: current.at,
          gapMinutes,
        });
      }
    }

    return {
      sources: Array.from(new Set(ordered.map((event) => event.source))),
      gaps,
      timeline: ordered.map((event, index) => ({
        index: index + 1,
        ...event,
      })),
    };
  },
});
