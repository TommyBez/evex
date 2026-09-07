import type { ScoredChange } from "./thresholds.js";
import type { WatchConfig } from "./watch-config.js";

export type DigestDraft = {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly slackText: string;
  readonly changeCount: number;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const changeLine = (change: ScoredChange): string =>
  `${change.url} — score ${change.score}/100, ${change.changedChars} changed characters. ${change.excerpt}`;

export const buildDigestDraft = (
  changes: readonly ScoredChange[],
  config: Pick<WatchConfig, "digest">,
  runDate: string,
): DigestDraft => {
  const subject = `${config.digest.subject} — ${runDate}`;
  const intro =
    changes.length === 1
      ? `1 competitor page cleared the alert thresholds on ${runDate}.`
      : `${changes.length} competitor pages cleared the alert thresholds on ${runDate}.`;

  const rows = changes
    .map((change) => {
      const excerpt = escapeHtml(change.excerpt || "No excerpt.");
      return `<tr>
  <td><a href="${escapeHtml(change.url)}">${escapeHtml(change.url)}</a></td>
  <td>${change.score}</td>
  <td>${change.changedChars}</td>
  <td>${excerpt}</td>
</tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body>
    <div lang="en" dir="ltr">
      <h1>${escapeHtml(subject)}</h1>
      <p>${escapeHtml(intro)}</p>
      <table role="presentation">
        <thead>
          <tr>
            <th>URL</th>
            <th>Score</th>
            <th>Changed characters</th>
            <th>Excerpt</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
  </body>
</html>`;

  const text = [intro, ...changes.map((change) => changeLine(change))].join("\n\n");
  const slackText = [`Competitor intel digest (${runDate})`, intro, ...changes.map((change) => `• ${changeLine(change)}`)].join(
    "\n",
  );

  return {
    subject,
    html,
    text,
    slackText,
    changeCount: changes.length,
  };
};

export const utcDateStamp = (now: Date = new Date()): string => now.toISOString().slice(0, 10);
