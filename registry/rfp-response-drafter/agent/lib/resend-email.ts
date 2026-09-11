import type { FetchLike } from "./oauth";

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

type ResendResponse = {
  readonly id?: string;
  readonly message?: string;
  readonly name?: string;
};

export function createResendSender(input: {
  readonly apiKey: string;
  readonly fetchImpl?: FetchLike;
}): EmailSender {
  const fetchImpl = input.fetchImpl ?? fetch;
  return async (payload) => {
    let response: Response;
    try {
      response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${input.apiKey}`,
          "content-type": "application/json",
          "idempotency-key": payload.idempotencyKey,
        },
        body: JSON.stringify({
          from: payload.from,
          to: [...payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      return {
        error: {
          name: "resend_transport_failed",
          message:
            error instanceof Error ? error.message : "Resend request failed.",
        },
      };
    }
    let body: ResendResponse = {};
    try {
      body = (await response.json()) as ResendResponse;
    } catch {
      body = {};
    }
    if (!response.ok) {
      return {
        error: {
          name: body.name ?? "resend_failed",
          message: body.message ?? `Resend emails failed (${response.status}).`,
        },
      };
    }
    return { id: body.id };
  };
}
