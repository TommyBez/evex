import type { ChurnRenewalConfig } from "../renewal-config";
import {
  createAccessTokenCache,
  mintConnectAccessToken,
  STRIPE_CONNECT_SCOPES,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { assertNeverEmailCustomer } from "../send-guard";
import type { HealthLookup, RenewalAccount, StripeHealth } from "../score";
import { asRecord, stringField } from "../untrusted";
import { readJson } from "./http";

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeHealthClient = {
  loadHealth(account: RenewalAccount): Promise<HealthLookup>;
};

export function createStripeClient(
  config: ChurnRenewalConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): StripeHealthClient | null {
  const connectUid = config.stripe.connectUid;
  if (!connectUid) {
    return null;
  }

  const token = createAccessTokenCache(() =>
    mintConnectAccessToken({
      connectorUid: connectUid,
      scopes: STRIPE_CONNECT_SCOPES,
      mintImpl,
    }),
  );

  return {
    async loadHealth(account) {
      return loadStripeHealth({
        account,
        fetchImpl,
        token,
      });
    },
  };
}

async function stripeGet(input: {
  readonly fetchImpl: FetchLike;
  readonly token: () => Promise<string>;
  readonly path: string;
}): Promise<Response> {
  const url = `${STRIPE_API}${input.path}`;
  assertNeverEmailCustomer(url, "GET");
  return input.fetchImpl(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await input.token()}`,
    },
  });
}

export function resolveStripeCustomerId(
  account: RenewalAccount,
): string | undefined {
  const id = account.stripeCustomerId?.trim();
  if (!id) {
    return undefined;
  }
  if (!/^cus_[A-Za-z0-9]+$/.test(id)) {
    return undefined;
  }
  return id;
}

export function healthFromStripePayloads(input: {
  readonly customerId: string;
  readonly customer: unknown;
  readonly subscriptions: unknown;
  readonly invoices: unknown;
  readonly charges: unknown;
}): StripeHealth {
  const customer = asRecord(input.customer);
  const subscriptions = Array.isArray(asRecord(input.subscriptions).data)
    ? (asRecord(input.subscriptions).data as unknown[])
    : [];
  const invoices = Array.isArray(asRecord(input.invoices).data)
    ? (asRecord(input.invoices).data as unknown[])
    : [];
  const charges = Array.isArray(asRecord(input.charges).data)
    ? (asRecord(input.charges).data as unknown[])
    : [];

  const firstSub = asRecord(subscriptions[0]);
  const subscriptionStatus = stringField(firstSub, "status");
  const unpaidInvoices = invoices.filter((invoice) => {
    const status = stringField(asRecord(invoice), "status");
    return status === "open" || status === "uncollectible";
  }).length;
  const openInvoiceCents = invoices.reduce<number>((sum, invoice) => {
    const amount = asRecord(invoice).amount_remaining;
    return sum + (typeof amount === "number" ? amount : 0);
  }, 0);
  const failedCharges30d = charges.filter((charge) => {
    const record = asRecord(charge);
    return record.paid === false || record.status === "failed";
  }).length;

  return {
    customerId: input.customerId,
    status: customer.delinquent === true ? "delinquent" : "current",
    delinquent: customer.delinquent === true,
    pastDue:
      subscriptionStatus === "past_due" || subscriptionStatus === "unpaid",
    unpaidInvoices,
    failedCharges30d,
    openInvoiceCents,
    subscriptionStatus,
  };
}

async function loadStripeHealth(input: {
  readonly account: RenewalAccount;
  readonly fetchImpl: FetchLike;
  readonly token: () => Promise<string>;
}): Promise<HealthLookup> {
  const customerId = resolveStripeCustomerId(input.account);
  if (!customerId) {
    return {
      ok: false,
      failClosed: true,
      note: "Health failed closed: Stripe customer id is missing or invalid.",
    };
  }

  try {
    const customerResponse = await stripeGet({
      fetchImpl: input.fetchImpl,
      token: input.token,
      path: `/customers/${encodeURIComponent(customerId)}`,
    });
    if (!customerResponse.ok) {
      return {
        ok: false,
        failClosed: true,
        note: `Health failed closed: Stripe customer lookup returned HTTP ${customerResponse.status}.`,
      };
    }
    const [subscriptions, invoices, charges] = await Promise.all([
      stripeGet({
        fetchImpl: input.fetchImpl,
        token: input.token,
        path: `/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=1`,
      }),
      stripeGet({
        fetchImpl: input.fetchImpl,
        token: input.token,
        path: `/invoices?customer=${encodeURIComponent(customerId)}&status=open&limit=10`,
      }),
      stripeGet({
        fetchImpl: input.fetchImpl,
        token: input.token,
        path: `/charges?customer=${encodeURIComponent(customerId)}&limit=10`,
      }),
    ]);
    if (!(subscriptions.ok && invoices.ok && charges.ok)) {
      return {
        ok: false,
        failClosed: true,
        note: "Health failed closed: Stripe subscription, invoice, or charge lookup failed.",
      };
    }
    return {
      ok: true,
      failClosed: false,
      health: healthFromStripePayloads({
        customerId,
        customer: await readJson(customerResponse),
        subscriptions: await readJson(subscriptions),
        invoices: await readJson(invoices),
        charges: await readJson(charges),
      }),
    };
  } catch {
    return {
      ok: false,
      failClosed: true,
      note: "Health failed closed: Stripe request could not be completed.",
    };
  }
}
