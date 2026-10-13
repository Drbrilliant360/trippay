import type { Transaction, TransactionStatus } from "@/lib/types";
import { db, delay } from "./mock/db";

export interface TransactionFilter {
  status?: TransactionStatus;
  query?: string;
}

export async function listTransactions(
  filter: TransactionFilter = {},
): Promise<Transaction[]> {
  await delay();
  let rows = db().transactions;
  if (filter.status) {
    rows = rows.filter((t) => t.status === filter.status);
  }
  if (filter.query) {
    const q = filter.query.toLowerCase();
    rows = rows.filter(
      (t) =>
        t.reference.toLowerCase().includes(q) ||
        t.merchant?.name.toLowerCase().includes(q) ||
        t.bookingRef?.toLowerCase().includes(q),
    );
  }
  return structuredClone(
    [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  await delay(350);
  const found = db().transactions.find((t) => t.id === id || t.reference === id);
  return found ? structuredClone(found) : null;
}
