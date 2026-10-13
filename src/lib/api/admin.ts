import type {
  AuditEntry,
  DisputeCase,
  Money,
  ProviderHealth,
  ReconciliationRow,
  Transaction,
  TransactionStatus,
} from "@/lib/types";
import { db, delay } from "./mock/db";
import {
  AUDIT_LOG,
  DISPUTES,
  PROVIDERS,
  RECONCILIATION,
  VERIFICATION_QUEUE,
} from "./mock/seed";

export interface AdminOverview {
  paymentsToday: number;
  successRatePct: number;
  failedToday: number;
  pendingOver15m: number;
  openCases: number;
  riskFlags: number;
  verificationQueue: number;
  recon: { matched: number; differences: number };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await delay(500);
  return {
    paymentsToday: 1318,
    successRatePct: 97.6,
    failedToday: 31,
    pendingOver15m: 7,
    openCases: 14,
    riskFlags: 3,
    verificationQueue: VERIFICATION_QUEUE.length,
    recon: { matched: 1204, differences: 3 },
  };
}

export type VerificationItem = (typeof VERIFICATION_QUEUE)[number];

export async function listVerificationQueue(): Promise<VerificationItem[]> {
  await delay();
  return structuredClone(VERIFICATION_QUEUE);
}

export async function searchTransactions(query: string): Promise<Transaction[]> {
  await delay(600);
  const q = query.trim().toLowerCase();
  const rows = db().transactions.filter(
    (t) =>
      !q ||
      t.reference.toLowerCase().includes(q) ||
      t.merchant?.name.toLowerCase().includes(q) ||
      t.providerRef?.toLowerCase().includes(q),
  );
  return structuredClone(rows);
}

export async function listDisputes(): Promise<DisputeCase[]> {
  await delay();
  return structuredClone(DISPUTES);
}

export async function listProviders(): Promise<ProviderHealth[]> {
  await delay();
  return structuredClone(PROVIDERS);
}

export async function listReconciliation(): Promise<ReconciliationRow[]> {
  await delay();
  return structuredClone(RECONCILIATION);
}

export async function listAuditLog(): Promise<AuditEntry[]> {
  await delay();
  return structuredClone(AUDIT_LOG);
}

export interface SensitiveActionParams {
  action: string;
  targetId: string;
  reason: string;
}

/** Every sensitive admin action is audit-logged with its reason. */
export async function performSensitiveAction(
  params: SensitiveActionParams,
): Promise<{ ok: true; auditId: string }> {
  await delay(900);
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    actor: "Joseph Kessy",
    actorRole: "admin_super",
    action: params.action,
    targetType: "transaction",
    targetId: params.targetId,
    reason: params.reason,
    at: new Date().toISOString(),
  };
  AUDIT_LOG.unshift(entry);
  return { ok: true, auditId: entry.id };
}

// ---------------------------------------------------------------------------
// Overview transaction search (ops cockpit)
// ---------------------------------------------------------------------------

export type AdminTxStepKey = "created" | "sent" | "awaiting" | "completed" | "failed";

export interface AdminTxRow {
  id: string;
  reference: string;
  /** Raw PII — the UI masks it by default (lib/mask); unmasking is audit-logged. */
  userName: string;
  userId: string;
  userPhone: string;
  merchant: string;
  amount: Money;
  fee: Money;
  provider: string;
  providerRef: string;
  status: TransactionStatus;
  createdAt: string;
  timeline: { step: AdminTxStepKey; at: string | null }[];
}

/** Today at h:m East Africa Time (UTC+3, no DST), independent of the machine's timezone. */
const todayAt = (h: number, m: number, s = 0): string => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h - 3, m, s),
  ).toISOString();
};

const ADMIN_TX: AdminTxRow[] = [
  {
    id: "atx1",
    reference: "TP-9HD1-77QE",
    userName: "David Mwangi",
    userId: "u_7f3a9c21",
    userPhone: "+255 654 321 789",
    merchant: "Azam Marine",
    amount: { amountMinor: 70_000, currency: "TZS" },
    fee: { amountMinor: 700, currency: "TZS" },
    provider: "Mobile money B",
    providerRef: "MMB-2026101214300912",
    status: "pending",
    createdAt: todayAt(14, 30, 5),
    timeline: [
      { step: "created", at: todayAt(14, 30, 5) },
      { step: "sent", at: todayAt(14, 30, 7) },
      { step: "awaiting", at: null },
    ],
  },
  {
    id: "atx2",
    reference: "TP-1XK4-02MB",
    userName: "Sophie Laurent",
    userId: "u_2b8e4d10",
    userPhone: "+255 688 442 214",
    merchant: "Kilimanjaro Trails",
    amount: { amountMinor: 147_900, currency: "USD" },
    fee: { amountMinor: 2_900, currency: "USD" },
    provider: "Card",
    providerRef: "CRD-2026101213120447",
    status: "successful",
    createdAt: todayAt(13, 12, 0),
    timeline: [
      { step: "created", at: todayAt(13, 12, 0) },
      { step: "sent", at: todayAt(13, 12, 2) },
      { step: "completed", at: todayAt(13, 12, 9) },
    ],
  },
  {
    id: "atx3",
    reference: "TP-0QZ7-58VC",
    userName: "Amani Hassan",
    userId: "u_9c1f7e55",
    userPhone: "+255 679 005 903",
    merchant: "Moshi Mountain Guides",
    amount: { amountMinor: 380_000, currency: "TZS" },
    fee: { amountMinor: 3_800, currency: "TZS" },
    provider: "Mobile money A",
    providerRef: "MMA-2026101211470330",
    status: "failed",
    createdAt: todayAt(11, 47, 0),
    timeline: [
      { step: "created", at: todayAt(11, 47, 0) },
      { step: "sent", at: todayAt(11, 47, 1) },
      { step: "failed", at: todayAt(11, 47, 24) },
    ],
  },
];

export async function searchAdminTransactions(query: string): Promise<AdminTxRow[]> {
  await delay(500);
  const q = query.trim().toLowerCase();
  const digits = q.replace(/[^\d]/g, "");
  const rows = ADMIN_TX.filter((row) => {
    if (!q) return true;
    const phoneDigits = row.userPhone.replace(/[^\d]/g, "");
    return (
      row.reference.toLowerCase().includes(q) ||
      row.merchant.toLowerCase().includes(q) ||
      row.userName.toLowerCase().includes(q) ||
      row.providerRef.toLowerCase().includes(q) ||
      (digits.length >= 3 && phoneDigits.includes(digits))
    );
  });
  return structuredClone(rows);
}

// ---------------------------------------------------------------------------
// Daily reconciliation (ledger vs provider settlement file)
// ---------------------------------------------------------------------------

export type ReconExceptionType =
  | "missing_at_provider"
  | "amount_mismatch"
  | "status_mismatch"
  | "duplicate";

export interface DailyReconException {
  id: string;
  reference: string;
  ledgerAmount: Money | null;
  providerAmount: Money | null;
  ledgerStatus: TransactionStatus | null;
  providerStatus: TransactionStatus | null;
  /** The provider row is a duplicated line in the settlement file. */
  secondLine?: boolean;
  type: ReconExceptionType;
  assignee: string | null;
}

export interface DailyRecon {
  ledgerTotal: Money;
  ledgerEntries: number;
  providerTotal: Money;
  providerLines: number;
  fileName: string;
  difference: Money;
  exceptions: DailyReconException[];
}

export interface ReconRun {
  id: string;
  ranAt: string;
  date: string;
  provider: string;
  file: string;
  differences: number;
  by: string | null;
}

export const RECON_PROVIDERS = [
  "Mobile money provider A",
  "Mobile money provider B",
  "Card processor",
  "Bank transfer rail",
] as const;

const OPEN_EXCEPTIONS: DailyReconException[] = [
  { id: "ex1", reference: "TP-9HD1-77QE", ledgerAmount: { amountMinor: 70_000, currency: "TZS" }, providerAmount: null, ledgerStatus: "pending", providerStatus: null, type: "missing_at_provider", assignee: "R. Mfinanga" },
  { id: "ex2", reference: "TP-2CV8-19NH", ledgerAmount: { amountMinor: 450_000, currency: "TZS" }, providerAmount: { amountMinor: 300_000, currency: "TZS" }, ledgerStatus: "successful", providerStatus: "successful", type: "amount_mismatch", assignee: "B. Swai" },
  { id: "ex3", reference: "TP-6WE3-40GF", ledgerAmount: { amountMinor: 0, currency: "TZS" }, providerAmount: { amountMinor: 0, currency: "TZS" }, ledgerStatus: "failed", providerStatus: "successful", type: "status_mismatch", assignee: null },
  { id: "ex4", reference: "TP-4LM2-66JD", ledgerAmount: null, providerAmount: { amountMinor: 150_000, currency: "TZS" }, ledgerStatus: null, providerStatus: "successful", secondLine: true, type: "duplicate", assignee: null },
];

const RECON_RUNS: ReconRun[] = [
  { id: "run1", ranAt: todayAt(14, 5), date: "2026-10-11", provider: "Mobile money provider B", file: "settlement_20261011.csv", differences: 3, by: "B. Swai" },
  { id: "run2", ranAt: todayAt(9, 12), date: "2026-10-11", provider: "Mobile money provider A", file: "mma_1011.csv", differences: 0, by: null },
  { id: "run3", ranAt: new Date(Date.now() - 26 * 3_600_000).toISOString(), date: "2026-10-10", provider: "Card processor", file: "card_settle_1010.csv", differences: 0, by: null },
];

const tzs = (amountMinor: number): Money => ({ amountMinor, currency: "TZS" });

/**
 * One provider-day carries the open exception set; every other combination is
 * balanced, so the filters demonstrably change the result.
 */
export async function getDailyReconciliation(params: {
  date: string;
  provider: string;
}): Promise<DailyRecon> {
  await delay(600);
  const isExceptionDay =
    params.provider === "Mobile money provider B" && params.date === "2026-10-11";

  if (isExceptionDay) {
    const exceptions = structuredClone(OPEN_EXCEPTIONS);
    return {
      ledgerTotal: tzs(412_860_500),
      ledgerEntries: 1_207,
      providerTotal: tzs(412_790_500),
      providerLines: 1_207,
      fileName: "settlement_20261011.csv",
      difference: tzs(70_000),
      exceptions,
    };
  }

  // Deterministic balanced day derived from the provider name.
  const seedNum = [...params.provider].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const total = tzs(80_000_000 + seedNum * 137_000);
  const entries = 400 + (seedNum % 300);
  return {
    ledgerTotal: total,
    ledgerEntries: entries,
    providerTotal: structuredClone(total),
    providerLines: entries,
    fileName: `settlement_${params.date.replaceAll("-", "")}.csv`,
    difference: tzs(0),
    exceptions: [],
  };
}

export async function listReconRuns(): Promise<ReconRun[]> {
  await delay(300);
  return structuredClone(RECON_RUNS);
}

/** Correction entries resolve an exception; balances are never silently edited. */
export async function resolveReconException(id: string): Promise<{ ok: true }> {
  await delay(400);
  const index = OPEN_EXCEPTIONS.findIndex((e) => e.id === id);
  if (index >= 0) OPEN_EXCEPTIONS.splice(index, 1);
  return { ok: true };
}
