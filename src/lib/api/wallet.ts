import type { WalletBalance } from "@/lib/types";
import { db, delay } from "./mock/db";

export async function getWalletBalances(): Promise<WalletBalance[]> {
  await delay();
  return structuredClone(db().balances);
}

export async function getBalance(
  currency: WalletBalance["currency"],
): Promise<WalletBalance | undefined> {
  await delay(300);
  const found = db().balances.find((b) => b.currency === currency);
  return found ? structuredClone(found) : undefined;
}
