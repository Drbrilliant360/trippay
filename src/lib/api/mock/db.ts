import type { PaymentRequest, SavingsGoal, Transaction, WalletBalance } from "@/lib/types";
import {
  PAYMENT_REQUESTS,
  SAVINGS_GOALS,
  TRANSACTIONS,
  WALLET_BALANCES,
} from "./seed";

/**
 * In-memory mock database. Lives for the browser session; the real backend
 * replaces lib/api/* implementations without touching UI components.
 */
interface MockDb {
  balances: WalletBalance[];
  transactions: Transaction[];
  paymentRequests: PaymentRequest[];
  savingsGoals: SavingsGoal[];
  /** idempotencyKey -> transaction id, to prevent duplicate submissions */
  idempotency: Map<string, string>;
}

const globalStore = globalThis as unknown as { __trippayMockDb?: MockDb };

export function db(): MockDb {
  if (!globalStore.__trippayMockDb) {
    globalStore.__trippayMockDb = {
      balances: structuredClone(WALLET_BALANCES),
      transactions: structuredClone(TRANSACTIONS),
      paymentRequests: structuredClone(PAYMENT_REQUESTS),
      savingsGoals: structuredClone(SAVINGS_GOALS),
      idempotency: new Map(),
    };
  }
  return globalStore.__trippayMockDb;
}

/**
 * Call sites pass realistic API latencies (200–1400ms); the scale shrinks them
 * all proportionally so the app stays snappy while loading states still show.
 * Set to 1 to rehearse real-world latency.
 */
const LATENCY_SCALE = 0.25;

export function delay(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.round(ms * LATENCY_SCALE)));
}

export function newReference(): string {
  const block = () =>
    Array.from({ length: 4 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ123456789".charAt(Math.floor(Math.random() * 33)),
    ).join("");
  return `TP-${block()}-${block()}`;
}
