import { defineSchedule } from "eve/schedules";

import { pseoConfig } from "../lib/pseo-config.js";

export default defineSchedule({
  cron: pseoConfig.weeklyCron,
  markdown: `Run the weekly programmatic SEO batch, following your instructions end to end.

Parameters for this run: target directory ${pseoConfig.targetDir}, minimum search volume ${pseoConfig.minSearchVolume}, at most ${pseoConfig.maxPagesPerRun} pages, publish branch pseo/<year>-w<ISO week> derived from today's date.

If the /workspace/repo checkout is missing, required configuration is absent, or no keyword clears the volume bar, stop and report why instead of forcing output.`,
});
