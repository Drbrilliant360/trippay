import type {
  BizStats,
  Business,
  Currency,
  Money,
  PaymentRequest,
  Payout,
  Settlement,
  StaffMember,
  Supplier,
  Transaction,
} from "@/lib/types";
import { db, delay } from "./mock/db";
import {
  BIZ_STATS,
  BUSINESS,
  MERCHANTS,
  PAYOUTS,
  SETTLEMENTS,
  STAFF,
  SUPPLIERS,
} from "./mock/seed";

export async function getBusiness(): Promise<Business> {
  await delay(250);
  return structuredClone(BUSINESS);
}

export async function getBizStats(): Promise<BizStats> {
  await delay(600);
  return structuredClone(BIZ_STATS);
}

export async function listBizTransactions(): Promise<Transaction[]> {
  await delay();
  // The business sees incoming customer payments: reuse traveller txs that
  // target this business, flipped to the receiving side.
  const incoming = db()
    .transactions.filter((t) => t.merchant?.id === "m1" && t.type === "payment")
    .map((t) => ({ ...t, direction: "in" as const }));
  return structuredClone(incoming);
}

export async function listBizPaymentRequests(): Promise<PaymentRequest[]> {
  await delay();
  return structuredClone(db().paymentRequests);
}

export interface CreateRequestParams {
  bookingRef: string;
  customerName: string;
  customerContact?: string;
  feePayer: "customer" | "business";
  amountMinor: number;
  currency: Currency;
  description: string;
  expiresInHours: number;
}

/**
 * Indicative mid-rates used ONLY for mock display conversion in reports.
 * Real FX execution stays gated behind flags.
 */
const USD_PER_UNIT: Record<Currency, number> = {
  USD: 1,
  TZS: 1 / 2615.4,
  EUR: 1.0913,
  GBP: 1.2705,
};

/** Converts any Money to USD minor units (mock display conversion). */
function toUsdMinor(m: Money): number {
  if (m.currency === "USD") return m.amountMinor;
  // TZS has 0 decimals; USD/EUR/GBP have 2.
  const major = m.currency === "TZS" ? m.amountMinor : m.amountMinor / 100;
  return Math.round(major * USD_PER_UNIT[m.currency] * 100);
}

export interface RequestFeeQuote {
  fee: Money;
  /** What the customer is asked to pay. */
  customerTotal: Money;
  /** What the business receives after the fee. */
  netToBusiness: Money;
}

/** Platform fee for a payment request — always quoted by the API (2%). */
export async function getRequestFeeQuote(params: {
  amountMinor: number;
  currency: Currency;
  feePayer: "customer" | "business";
}): Promise<RequestFeeQuote> {
  await delay(350);
  const { amountMinor, currency, feePayer } = params;
  const fee = Math.round(amountMinor * 0.02);
  return {
    fee: { amountMinor: fee, currency },
    customerTotal: {
      amountMinor: feePayer === "customer" ? amountMinor + fee : amountMinor,
      currency,
    },
    netToBusiness: {
      amountMinor: feePayer === "customer" ? amountMinor : amountMinor - fee,
      currency,
    },
  };
}

export async function createPaymentRequest(
  params: CreateRequestParams,
): Promise<PaymentRequest> {
  await delay(800);
  const request: PaymentRequest = {
    id: crypto.randomUUID(),
    merchant: structuredClone(MERCHANTS[0]),
    bookingRef: params.bookingRef,
    customerName: params.customerName,
    customerContact: params.customerContact,
    feePayer: params.feePayer,
    amount: { amountMinor: params.amountMinor, currency: params.currency },
    description: params.description,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + params.expiresInHours * 3_600_000,
    ).toISOString(),
    status: "open",
  };
  db().paymentRequests.unshift(request);
  return structuredClone(request);
}

export async function listSuppliers(): Promise<Supplier[]> {
  await delay();
  return structuredClone(SUPPLIERS);
}

export async function listPayouts(): Promise<Payout[]> {
  await delay();
  return structuredClone(PAYOUTS);
}

/** Payouts above this USD value require a second approver. */
export const DUAL_APPROVAL_THRESHOLD_USD_MINOR = 100_000;

function needsSecondApprover(amount: Money): boolean {
  return toUsdMinor(amount) >= DUAL_APPROVAL_THRESHOLD_USD_MINOR;
}

export interface SubmitPayoutParams {
  idempotencyKey: string;
  supplierId: string;
  amountMinor: number;
  currency: Currency;
  reference?: string;
}

export async function getPayoutQuote(params: {
  supplierId: string;
  amountMinor: number;
  currency: Currency;
}): Promise<{ fee: number; total: number; needsSecondApproval: boolean }> {
  await delay(450);
  void params.supplierId;
  const fee = Math.round(params.amountMinor * 0.005);
  return {
    fee,
    total: params.amountMinor + fee,
    needsSecondApproval: needsSecondApprover({
      amountMinor: params.amountMinor,
      currency: params.currency,
    }),
  };
}

const submittedPayouts = new Map<string, Payout>();
/** Payouts still in flight, so a concurrent repeat of the same key awaits the
 * first call instead of queueing a second payout. */
const inFlightPayouts = new Map<string, Promise<Payout>>();

/** Every payout is submitted into the approval queue; big ones need a 2nd approver. */
export async function submitPayout(params: SubmitPayoutParams): Promise<Payout> {
  const existing = submittedPayouts.get(params.idempotencyKey);
  if (existing) return structuredClone(existing);

  const inFlight = inFlightPayouts.get(params.idempotencyKey);
  if (inFlight) return structuredClone(await inFlight);

  const run = performSubmitPayout(params);
  inFlightPayouts.set(params.idempotencyKey, run);
  try {
    return structuredClone(await run);
  } finally {
    // The committed payout is now covered by submittedPayouts.
    inFlightPayouts.delete(params.idempotencyKey);
  }
}

async function performSubmitPayout(params: SubmitPayoutParams): Promise<Payout> {
  await delay(1200);
  const supplier = SUPPLIERS.find((s) => s.id === params.supplierId);
  if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");
  const fee = Math.round(params.amountMinor * 0.005);
  const amount: Money = { amountMinor: params.amountMinor, currency: params.currency };
  const payout: Payout = {
    id: crypto.randomUUID(),
    supplier: structuredClone(supplier),
    amount,
    fee: { amountMinor: fee, currency: params.currency },
    total: { amountMinor: params.amountMinor + fee, currency: params.currency },
    status: "awaiting_authorisation",
    needsSecondApproval: needsSecondApprover(amount),
    requestedBy: "Asha Mrema",
    ref: params.reference || undefined,
    createdAt: new Date().toISOString(),
  };
  submittedPayouts.set(params.idempotencyKey, payout);
  PAYOUTS.unshift(payout);
  return structuredClone(payout);
}

export async function approvePayout(id: string): Promise<Payout> {
  await delay(700);
  const payout = PAYOUTS.find((p) => p.id === id);
  if (!payout) throw new Error("PAYOUT_NOT_FOUND");
  payout.status = "successful";
  return structuredClone(payout);
}

/** Rejection always carries a reason so the requester knows what to fix. */
export async function rejectPayout(params: { id: string; reason: string }): Promise<Payout> {
  await delay(700);
  if (!params.reason.trim()) throw new Error("REASON_REQUIRED");
  const payout = PAYOUTS.find((p) => p.id === params.id);
  if (!payout) throw new Error("PAYOUT_NOT_FOUND");
  payout.status = "rejected";
  return structuredClone(payout);
}

export async function listSettlements(): Promise<Settlement[]> {
  await delay();
  return structuredClone(SETTLEMENTS);
}

export async function listStaff(): Promise<StaffMember[]> {
  await delay();
  return structuredClone(STAFF);
}

// ---------------------------------------------------------------------------
// Reports & reconciliation
// ---------------------------------------------------------------------------

export type ReconStatus = "settled" | "pending" | "refunded";
export type ReconMethod = "mobile_money" | "card" | "bank";

export interface ReconRow {
  id: string;
  reference: string;
  bookingRef: string | null;
  /** null means a walk-in customer with no name on file. */
  customer: string | null;
  /** Negative for refunds. */
  gross: Money;
  fee: Money;
  status: ReconStatus;
  method: ReconMethod;
  matched: boolean;
  createdAt: string;
}

export interface ReconSummary {
  gross: Money;
  refunds: Money;
  fees: Money;
  net: Money;
  settled: Money;
  pending: Money;
}

export interface ReconReport {
  summary: ReconSummary;
  rows: ReconRow[];
  unmatchedCount: number;
}

const dayMs = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * dayMs).toISOString();

/** Session-mutable mock rows; "match to booking" updates them in place. */
const RECON_ROWS: ReconRow[] = [
  { id: "rr1", reference: "TP-8WQ3-55JR", bookingRef: "KT-2026-0412", customer: "David Mwangi", gross: { amountMinor: 1_250_000, currency: "TZS" }, fee: { amountMinor: 12_500, currency: "TZS" }, status: "settled", method: "mobile_money", matched: true, createdAt: ago(1) },
  { id: "rr2", reference: "TP-6FG2-08LK", bookingRef: null, customer: null, gross: { amountMinor: 18_000, currency: "USD" }, fee: { amountMinor: 360, currency: "USD" }, status: "pending", method: "card", matched: false, createdAt: ago(2) },
  { id: "rr3", reference: "TP-7KD1-44RS", bookingRef: "KT-2026-0405", customer: "James Carter", gross: { amountMinor: 118_000, currency: "USD" }, fee: { amountMinor: 2_360, currency: "USD" }, status: "settled", method: "card", matched: true, createdAt: ago(4) },
  { id: "rr4", reference: "TP-3RS9-71PA", bookingRef: null, customer: "A. Schmidt", gross: { amountMinor: 32_000, currency: "EUR" }, fee: { amountMinor: 640, currency: "EUR" }, status: "settled", method: "card", matched: false, createdAt: ago(6) },
  { id: "rr5", reference: "TP-4QA9-27XE", bookingRef: "KT-2026-0396", customer: "Hannah Moore", gross: { amountMinor: -8_000, currency: "USD" }, fee: { amountMinor: 0, currency: "USD" }, status: "refunded", method: "card", matched: true, createdAt: ago(8) },
  { id: "rr6", reference: "TP-9HL4-03MN", bookingRef: "KT-2026-0389", customer: "Lukas Becker", gross: { amountMinor: 2_350_000, currency: "TZS" }, fee: { amountMinor: 23_500, currency: "TZS" }, status: "settled", method: "bank", matched: true, createdAt: ago(12) },
  { id: "rr7", reference: "TP-5TC8-66QW", bookingRef: "KT-2026-0382", customer: "Priya Nair", gross: { amountMinor: 42_000, currency: "USD" }, fee: { amountMinor: 840, currency: "USD" }, status: "settled", method: "mobile_money", matched: true, createdAt: ago(21) },
  { id: "rr8", reference: "TP-2WN7-19ZD", bookingRef: "KT-2026-0371", customer: "Tom Okafor", gross: { amountMinor: 6_000, currency: "USD" }, fee: { amountMinor: 120, currency: "USD" }, status: "settled", method: "card", matched: true, createdAt: ago(45) },
];

export interface ReconFilters {
  rangeDays: 7 | 30 | 90;
  status: "all" | ReconStatus;
  method: "all" | ReconMethod;
}

const usd = (amountMinor: number): Money => ({ amountMinor, currency: "USD" });

/**
 * The report (totals included) comes from the API, converted to USD at mock
 * indicative rates — the frontend never aggregates money itself.
 */
export async function getReconciliationReport(filters: ReconFilters): Promise<ReconReport> {
  await delay(600);
  const cutoff = Date.now() - filters.rangeDays * dayMs;
  const rows = RECON_ROWS.filter(
    (r) =>
      new Date(r.createdAt).getTime() >= cutoff &&
      (filters.status === "all" || r.status === filters.status) &&
      (filters.method === "all" || r.method === filters.method),
  );

  let gross = 0;
  let refunds = 0;
  let fees = 0;
  let settled = 0;
  let pending = 0;
  for (const row of rows) {
    const grossUsd = toUsdMinor(row.gross);
    const feeUsd = toUsdMinor(row.fee);
    if (row.status === "refunded") {
      refunds += -grossUsd;
      continue;
    }
    gross += grossUsd;
    fees += feeUsd;
    if (row.status === "settled") settled += grossUsd - feeUsd;
    if (row.status === "pending") pending += grossUsd;
  }

  return {
    summary: {
      gross: usd(gross),
      refunds: usd(refunds),
      fees: usd(fees),
      net: usd(gross - refunds - fees),
      settled: usd(settled),
      pending: usd(pending),
    },
    rows: structuredClone(rows),
    unmatchedCount: rows.filter((r) => !r.matched).length,
  };
}

export async function matchRowToBooking(params: {
  id: string;
  bookingRef: string;
}): Promise<ReconRow> {
  await delay(600);
  const row = RECON_ROWS.find((r) => r.id === params.id);
  if (!row) throw new Error("ROW_NOT_FOUND");
  row.bookingRef = params.bookingRef;
  row.matched = true;
  return structuredClone(row);
}
