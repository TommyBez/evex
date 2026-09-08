export type SlackNotifyInput = {
  readonly webhookUrl: string;
  readonly draftCount: number;
  readonly buckets: readonly string[];
  readonly fetchImpl?: typeof fetch;
};

export type SlackNotifyResult =
  | { readonly notified: true; readonly sent: false }
  | { readonly notified: false; readonly note: string };

export async function notifySlackDraftsReady(
  input: SlackNotifyInput,
): Promise<SlackNotifyResult> {
  const text = [
    `${input.draftCount} inbox draft${input.draftCount === 1 ? "" : "s"} ready in Drafts.`,
    input.buckets.length > 0
      ? `Buckets: ${input.buckets.join(", ")}.`
      : null,
    "Nothing was sent. Review the drafts in the mailbox and send them yourself.",
  ]
    .filter(Boolean)
    .join(" ");

  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(input.webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    return {
      notified: false,
      note: `Slack webhook returned ${response.status}.`,
    };
  }

  return { notified: true, sent: false };
}
