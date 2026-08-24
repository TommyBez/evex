import { defineSchedule } from "eve/schedules";

import { issueDigestConfig } from "../lib/issue-config";

const repo = issueDigestConfig.repo ?? "owner/repo";

export default defineSchedule({
  cron: issueDigestConfig.cron,
  markdown: `Run the weekly open GitHub issue digest for ${repo}.

1. Call list_open_issues to fetch open issues (not pull requests) for ISSUE_DIGEST_REPO.
2. Group issues into short sections: needs attention (no labels or thin/unanswered), recently updated, and stale (no activity for 14+ days when timestamps allow).
3. Call compose_digest_html with those sections. That tool HTML-escapes issue titles — never hand-write HTML that interpolates raw titles.
4. Call preview_digest_email with the HTML and a subject like "Weekly open-issue digest: ${repo}".
5. Send for real with send_digest_email confirmSend=true. The tool pins the Resend idempotency key to the current ISO week (github-issue-digest-YYYY-Www), so retries of this scheduled run never open a second send even if they cross midnight.

If any required environment variable is missing (GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_INSTALLATION_ID, ISSUE_DIGEST_REPO, ISSUE_DIGEST_FROM, ISSUE_DIGEST_TO, RESEND_API_KEY), stop and report the missing configuration. Never review pull requests. Never call send_digest_email without confirmSend=true.`,
});
