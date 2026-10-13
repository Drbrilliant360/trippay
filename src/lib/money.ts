import type { Currency, Money } from "./types";

/** Decimal places per currency. TZS is a 0-decimal currency. */
export const CURRENCY_DECIMALS: Record<Currency, number> = {
  TZS: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
};

export const CURRENCIES: Currency[] = ["TZS", "USD", "EUR", "GBP"];

export function minorFactor(currency: Currency): number {
  return 10 ** CURRENCY_DECIMALS[currency];
}

export function money(amountMinor: number, currency: Currency): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("Money must be integer minor units");
  }
  return { amountMinor, currency };
}

export function zero(currency: Currency): Money {
  return { amountMinor: 0, currency };
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function compareMoney(a: Money, b: Money): number {
  assertSameCurrency(a, b);
  return Math.sign(a.amountMinor - b.amountMinor);
}

export function isPositive(m: Money): boolean {
  return m.amountMinor > 0;
}

/**
 * Formats money via Intl.NumberFormat with the currency's own decimal rules,
 * e.g. "TZS 1,250,000" or "USD 42.50". Always pair with the `money` CSS
 * utility class for tabular figures.
 */
export function formatMoney(m: Money, locale: string = "en"): string {
  const decimals = CURRENCY_DECIMALS[m.currency];
  const major = m.amountMinor / minorFactor(m.currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
    currencyDisplay: "code",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(major);
}

/** Formats just the number part, without the currency code. */
export function formatAmount(m: Money, locale: string = "en"): string {
  const decimals = CURRENCY_DECIMALS[m.currency];
  const major = m.amountMinor / minorFactor(m.currency);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(major);
}

/**
 * Parses user input (major units, as typed into a form) into integer minor
 * units without float arithmetic. Returns null when invalid.
 */
export function parseAmountToMinor(
  input: string,
  currency: Currency,
): number | null {
  const cleaned = input.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d*)?$/.test(cleaned)) return null;
  const decimals = CURRENCY_DECIMALS[currency];
  const [wholePart, fractionPart = ""] = cleaned.split(".");
  if (fractionPart.length > decimals) return null;
  const paddedFraction = fractionPart.padEnd(decimals, "0");
  const minor = Number(wholePart + paddedFraction);
  return Number.isSafeInteger(minor) ? minor : null;
}
