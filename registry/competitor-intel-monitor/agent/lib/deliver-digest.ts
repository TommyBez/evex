import { buildDigestDraft, utcDateStamp, type DigestDraft } from "./digest.js";
import type { DeliveryState, SnapshotStore } from "./snapshot-store.js";
import type { ScoredChange } from "./thresholds.js";
import type { WatchConfig } from "./watch-config.js";

export type EmailSendResult = {
  readonly id?: string;
  readonly error?: { readonly message: string; readonly name: string };
};

export type EmailSender = (input: {
  readonly from: string;
  readonly to: readonly string[];
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly idempotencyKey: string;
}) => Promise<EmailSendResult>;

export type SlackPoster = (url: string, text: string) => Promise<Response>;

export type DeliverDigestInput = {
  readonly store: SnapshotStore;
  readonly alerts: readonly ScoredChange[];
  readonly digest: WatchConfig["digest"];
  readonly slackWebhookUrl?: string;
  readonly runDate?: string;
  readonly idempotencyKey: string;
  readonly sendEmail?: EmailSender;
  readonly postSlack?: SlackPoster;
};

export type DeliverDigestResult = {
  readonly sent: boolean;
  readonly replayed?: boolean;
  readonly idempotencyKey: string;
  readonly slackSent?: boolean;
  readonly slackUncertain?: boolean;
  readonly emailMessageId?: string;
  readonly changeCount?: number;
  readonly runDate?: string;
  readonly inProgress?: boolean;
  readonly channel?: "slack" | "email" | "snapshots";
  readonly error?: { readonly message: string; readonly name: string };
};

const defaultPostSlack: SlackPoster = async (url, text) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

export const deliveryChannelsComplete = (
  state: DeliveryState | null,
  slackConfigured: boolean,
  emailConfigured: boolean,
): boolean => {
  if (!state) {
    return false;
  }
  return (!slackConfigured || state.slackSent) && (!emailConfigured || Boolean(state.emailMessageId));
};

const uniqueUrls = (urls: readonly string[]): readonly string[] => [...new Set(urls)];

const withCommittedUrl = (state: DeliveryState, url: string): DeliveryState => {
  const committedUrls = uniqueUrls([...(state.committedUrls ?? []), url]);
  const alertUrls = state.alertUrls ?? [];
  const commitsDone = alertUrls.every((alertUrl) => committedUrls.includes(alertUrl));
  return {
    ...state,
    committedUrls,
    status: commitsDone && (state.slackSent || Boolean(state.emailMessageId)) ? "complete" : state.status,
  };
};

export const resumeSnapshotCommits = async (
  store: SnapshotStore,
  idempotencyKey: string,
  state: DeliveryState,
  urls: readonly string[],
): Promise<DeliveryState> => {
  const alertUrls = uniqueUrls(state.alertUrls ?? urls);
  let current: DeliveryState = {
    ...state,
    alertUrls,
  };
  const committed = new Set(current.committedUrls ?? []);
  for (const url of alertUrls) {
    if (committed.has(url)) {
      continue;
    }
    await store.commitPending(url);
    current = withCommittedUrl(current, url);
    await store.setDelivery(idempotencyKey, current);
    committed.add(url);
  }
  return current;
};

const persistDelivery = async (
  store: SnapshotStore,
  idempotencyKey: string,
  state: DeliveryState,
): Promise<DeliveryState> => {
  await store.setDelivery(idempotencyKey, state);
  return state;
};

export const deliverCompetitorDigest = async ({
  store,
  alerts,
  digest,
  slackWebhookUrl,
  runDate,
  idempotencyKey,
  sendEmail,
  postSlack = defaultPostSlack,
}: DeliverDigestInput): Promise<DeliverDigestResult> => {
  const slackConfigured = Boolean(slackWebhookUrl);
  const emailConfigured = Boolean(digest.from && digest.to.length > 0 && sendEmail);
  const cached = await store.getDelivery(idempotencyKey);
  const resolvedDate = cached?.runDate ?? runDate ?? utcDateStamp();
  const alertUrls = uniqueUrls(cached?.alertUrls ?? alerts.map((alert) => alert.url));
  const draft: DigestDraft = buildDigestDraft(alerts, { digest }, resolvedDate);

  const finish = async (
    state: DeliveryState,
    extras: Omit<DeliverDigestResult, "idempotencyKey" | "runDate">,
  ): Promise<DeliverDigestResult> => {
    try {
      const committed = await resumeSnapshotCommits(store, idempotencyKey, state, alertUrls);
      return {
        ...extras,
        sent: extras.sent,
        idempotencyKey,
        runDate: committed.runDate ?? resolvedDate,
        slackSent: committed.slackSent,
        emailMessageId: committed.emailMessageId,
      };
    } catch (error) {
      return {
        sent: false,
        idempotencyKey,
        runDate: resolvedDate,
        slackSent: state.slackSent,
        emailMessageId: state.emailMessageId,
        channel: "snapshots",
        error: {
          name: "snapshot_commit_failed",
          message: error instanceof Error ? error.message : "Failed to commit pending snapshots.",
        },
      };
    }
  };

  if (cached?.slackUncertain && slackConfigured && !cached.slackSent) {
    return {
      sent: false,
      idempotencyKey,
      runDate: resolvedDate,
      slackSent: false,
      slackUncertain: true,
      error: {
        name: "slack_delivery_uncertain",
        message:
          "A previous Slack attempt may have been delivered. This key will not post to Slack again.",
      },
    };
  }

  if (deliveryChannelsComplete(cached, slackConfigured, emailConfigured) && cached) {
    return finish(cached, { sent: true, replayed: true, changeCount: draft.changeCount });
  }

  const initial: DeliveryState = {
    status: "in_progress",
    slackSent: cached?.slackSent ?? false,
    slackUncertain: cached?.slackUncertain,
    emailMessageId: cached?.emailMessageId,
    runDate: resolvedDate,
    alertUrls,
    committedUrls: cached?.committedUrls ?? [],
    claimedAt: new Date().toISOString(),
    claimOwner: String(process.pid),
  };
  const claim = await store.claimDelivery(idempotencyKey, initial);
  let state = claim.state;

  if (claim.inProgress && slackConfigured && !state.slackSent) {
    return {
      sent: false,
      idempotencyKey,
      runDate: resolvedDate,
      inProgress: true,
      error: {
        name: "delivery_in_progress",
        message: "Another send already claimed this idempotency key.",
      },
    };
  }

  let slackSent = Boolean(state.slackSent);
  let emailMessageId = state.emailMessageId;

  if (slackWebhookUrl && !slackSent && !state.slackUncertain) {
    if (!claim.acquired) {
      return {
        sent: false,
        idempotencyKey,
        runDate: resolvedDate,
        inProgress: true,
        error: {
          name: "delivery_in_progress",
          message: "Another send already claimed this idempotency key.",
        },
      };
    }
    try {
      const slackResponse = await postSlack(slackWebhookUrl, draft.slackText);
      if (!slackResponse.ok) {
        await persistDelivery(store, idempotencyKey, {
          ...state,
          slackSent: false,
          claimedAt: undefined,
          claimOwner: undefined,
        });
        return {
          sent: false,
          idempotencyKey,
          runDate: resolvedDate,
          channel: "slack",
          error: {
            message: `Slack webhook returned HTTP ${slackResponse.status}`,
            name: "slack_webhook_failed",
          },
        };
      }
      slackSent = true;
      state = await persistDelivery(store, idempotencyKey, {
        ...state,
        slackSent: true,
        runDate: resolvedDate,
        alertUrls,
      });
    } catch {
      state = await persistDelivery(store, idempotencyKey, {
        ...state,
        slackSent: false,
        slackUncertain: true,
        runDate: resolvedDate,
        alertUrls,
      });
      return {
        sent: false,
        idempotencyKey,
        runDate: resolvedDate,
        slackSent: false,
        slackUncertain: true,
        channel: "slack",
        error: {
          name: "slack_delivery_uncertain",
          message: "Slack webhook fetch failed after the request may have been delivered.",
        },
      };
    }
  }

  if (emailConfigured && digest.from && sendEmail && !emailMessageId) {
    const emailResult = await sendEmail({
      from: digest.from,
      to: digest.to,
      subject: draft.subject,
      html: draft.html,
      text: draft.text,
      idempotencyKey,
    });
    if (emailResult.error) {
      return {
        sent: false,
        idempotencyKey,
        runDate: resolvedDate,
        slackSent,
        channel: "email",
        error: { message: emailResult.error.message, name: emailResult.error.name },
      };
    }
    emailMessageId = emailResult.id;
    state = await persistDelivery(store, idempotencyKey, {
      ...state,
      slackSent,
      emailMessageId,
      runDate: resolvedDate,
      alertUrls,
    });
  }

  return finish(
    {
      ...state,
      slackSent,
      emailMessageId,
      runDate: resolvedDate,
      alertUrls,
    },
    { sent: true, changeCount: draft.changeCount },
  );
};
