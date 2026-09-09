import { describe, expect, it } from "vitest";

import { jsonRequest } from "../agent/lib/http";
import type { FetchLike } from "../agent/lib/oauth";

const waitForAbort = (signal?: AbortSignal | null): Promise<never> =>
  new Promise((_, reject) => {
    const fail = () => {
      const error = new Error("The operation was aborted");
      error.name = "TimeoutError";
      reject(error);
    };
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      fail();
      return;
    }
    signal.addEventListener("abort", fail, { once: true });
  });

describe("jsonRequest", () => {
  it("aborts through a bounded timeout", async () => {
    const fetchImpl: FetchLike = async (_url, init) => waitForAbort(init?.signal);
    await expect(
      jsonRequest({
        url: "https://quickbooks.api.intuit.com/v3/company/1/invoice/1",
        fetchImpl,
        timeoutMs: 20,
      }),
    ).rejects.toThrow(/aborted|TimeoutError/i);
  });

  it("reports HTTP status when the body is empty or not JSON", async () => {
    const empty: FetchLike = async () =>
      new Response("", { status: 502, statusText: "Bad Gateway" });
    await expect(
      jsonRequest({
        url: "https://api.xero.com/api.xro/2.0/Invoices/1",
        fetchImpl: empty,
      }),
    ).rejects.toThrow(/failed \(502\)/);

    const html: FetchLike = async () =>
      new Response("<html>nope</html>", {
        status: 503,
        headers: { "content-type": "text/html" },
      });
    await expect(
      jsonRequest({
        url: "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
        method: "POST",
        draftsOnly: true,
        fetchImpl: html,
      }),
    ).rejects.toThrow(/failed \(503\)/);
  });
});
