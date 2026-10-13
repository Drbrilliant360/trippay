import type { RateAlert, RateQuote } from "@/lib/types";
import { delay } from "./mock/db";
import { RATES, RATE_ALERTS } from "./mock/seed";

export async function listRates(): Promise<RateQuote[]> {
  await delay();
  return structuredClone(RATES);
}

export async function listRateAlerts(): Promise<RateAlert[]> {
  await delay(300);
  return structuredClone(RATE_ALERTS);
}

export interface RatePoint {
  date: string;
  rate: number;
}

const HISTORY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Mock 30-day daily history for a pair: a deterministic wobble (±~1.5%)
 * around today's rate, so SSR and client renders agree. The last point is
 * always the current quote.
 */
export async function getRateHistory(pair: string): Promise<RatePoint[]> {
  await delay(400);
  const quote = RATES.find((r) => r.pair === pair);
  if (!quote) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const daysAgo = HISTORY_DAYS - 1 - i;
    const wobble =
      Math.sin(daysAgo / 3.2 + quote.rate) * 0.012 + Math.sin(daysAgo * 1.7) * 0.004;
    const drift = daysAgo * -0.0004 * Math.sign(quote.change24hPct || 1);
    const rate =
      daysAgo === 0 ? quote.rate : Number((quote.rate * (1 + wobble + drift)).toFixed(2));
    return { date: new Date(today.getTime() - daysAgo * DAY_MS).toISOString(), rate };
  });
}
