import type {
  Currency,
  MerchantSummary,
  PaymentMethodType,
  PaymentQuote,
  PaymentRequest,
  Transaction,
} from "@/lib/types";
import { CURRENCY_DECIMALS } from "@/lib/money";
import { db, delay, newReference } from "./mock/db";
import { MERCHANTS } from "./mock/seed";

/** Looks up a recipient by TripPay business code or phone number. */
export async function lookupRecipient(
  code: string,
): Promise<MerchantSummary | null> {
  await delay(600);
  const cleaned = code.trim().toUpperCase();
  const found = MERCHANTS.find(
    (m) => m.code === cleaned || m.name.toUpperCase() === cleaned,
  );
  return found ? structuredClone(found) : null;
}

/**
 * Fees ALWAYS come from this quote — components never calculate them.
 * Mock fee model: 1% of the amount, rounded to the currency's minor unit.
 */
export async function getPaymentQuote(params: {
  merchantId: string;
  amountMinor: number;
  currency: Currency;
}): Promise<PaymentQuote> {
  await delay(500);
  const merchant = MERCHANTS.find((m) => m.id === params.merchantId);
  if (!merchant) throw new Error("RECIPIENT_NOT_FOUND");
  const feeMinor = Math.round(params.amountMinor * 0.01);
  return {
    quoteId: crypto.randomUUID(),
    merchant: structuredClone(merchant),
    amount: { amountMinor: params.amountMinor, currency: params.currency },
    fee: { amountMinor: feeMinor, currency: params.currency },
    total: {
      amountMinor: params.amountMinor + feeMinor,
      currency: params.currency,
    },
    feePct: 1,
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  };
}

export interface SubmitPaymentParams {
  idempotencyKey: string;
  merchantId: string;
  amountMinor: number;
  currency: Currency;
  method: PaymentMethodType;
  bookingRef?: string;
  description?: string;
}

/** Submits in flight, keyed by idempotency key: a concurrent repeat (e.g. a
 * double-click that lands before the button disables) awaits the first call
 * instead of creating a second transaction. */
const inFlightPayments = new Map<string, Promise<Transaction>>();

/**
 * Demo behaviour, keyed off the major-unit amount so it is easy to trigger:
 *  - ends in 13  -> fails (provider declined)
 *  - ends in 99  -> stays pending (provider timeout — never shown as failed)
 *  - otherwise   -> succeeds
 * Repeating a submit with the same idempotency key returns the original
 * transaction — a duplicate charge is impossible.
 */
export async function submitPayment(
  params: SubmitPaymentParams,
): Promise<Transaction> {
  const store = db();
  const existingId = store.idempotency.get(params.idempotencyKey);
  if (existingId) {
    const existing = store.transactions.find((t) => t.id === existingId);
    if (existing) return structuredClone(existing);
  }

  const inFlight = inFlightPayments.get(params.idempotencyKey);
  if (inFlight) return structuredClone(await inFlight);

  const run = performSubmitPayment(params);
  inFlightPayments.set(params.idempotencyKey, run);
  try {
    return structuredClone(await run);
  } finally {
    // The committed transaction is now covered by the idempotency map.
    inFlightPayments.delete(params.idempotencyKey);
  }
}

async function performSubmitPayment(
  params: SubmitPaymentParams,
): Promise<Transaction> {
  const store = db();
  await delay(1400);

  const merchant = MERCHANTS.find((m) => m.id === params.merchantId);
  if (!merchant) throw new Error("RECIPIENT_NOT_FOUND");

  const major = Math.floor(
    params.amountMinor / 10 ** CURRENCY_DECIMALS[params.currency],
  );
  const lastTwo = major % 100;
  const outcome: Transaction["status"] =
    lastTwo === 13 ? "failed" : lastTwo === 99 ? "pending" : "successful";

  const feeMinor = Math.round(params.amountMinor * 0.01);
  const nowIso = new Date().toISOString();
  const tx: Transaction = {
    id: crypto.randomUUID(),
    reference: newReference(),
    type: "payment",
    direction: "out",
    amount: { amountMinor: params.amountMinor, currency: params.currency },
    fee: { amountMinor: feeMinor, currency: params.currency },
    total: {
      amountMinor: params.amountMinor + feeMinor,
      currency: params.currency,
    },
    status: outcome,
    merchant: structuredClone(merchant),
    bookingRef: params.bookingRef,
    method: params.method,
    providerRef:
      outcome === "failed" ? undefined : `MM-${Math.floor(Math.random() * 1e8)}`,
    description: params.description,
    createdAt: nowIso,
    updatedAt: nowIso,
    timeline: [
      { status: "created", at: nowIso },
      { status: "awaiting_authorisation", at: nowIso },
      ...(outcome === "successful"
        ? ([{ status: "pending", at: nowIso }, { status: "successful", at: nowIso }] as const)
        : ([{ status: outcome, at: nowIso }] as const)),
    ],
  };

  store.transactions.unshift(tx);
  store.idempotency.set(params.idempotencyKey, tx.id);

  if (outcome === "successful") {
    const balance = store.balances.find((b) => b.currency === params.currency);
    if (balance) {
      balance.available.amountMinor -= tx.total.amountMinor;
      balance.updatedAt = nowIso;
    }
  } else if (outcome === "pending") {
    const balance = store.balances.find((b) => b.currency === params.currency);
    if (balance) {
      balance.available.amountMinor -= tx.total.amountMinor;
      balance.pending.amountMinor += tx.total.amountMinor;
      balance.updatedAt = nowIso;
    }
  }

  return structuredClone(tx);
}

export async function listOpenPaymentRequests(): Promise<PaymentRequest[]> {
  await delay();
  return structuredClone(db().paymentRequests);
}
