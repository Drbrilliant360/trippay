export type Currency = "TZS" | "USD" | "EUR" | "GBP";

/** Money is always integer minor units — never floats. TZS has 0 decimals. */
export interface Money {
  amountMinor: number;
  currency: Currency;
}

export type TransactionStatus =
  | "created"
  | "awaiting_authorisation"
  | "pending"
  | "successful"
  | "failed"
  | "expired"
  | "reversed"
  | "refunded"
  | "rejected"
  | "under_review";

export type PaymentMethodType = "mobile_money" | "card" | "bank_transfer";

export type TransactionType =
  | "payment"
  | "top_up"
  | "payout"
  | "refund"
  | "transfer"
  | "settlement";

export type TransactionDirection = "in" | "out";

export interface TimelineEntry {
  status: TransactionStatus;
  at: string; // ISO datetime
}

export interface MerchantSummary {
  id: string;
  name: string;
  /** TripPay business code, e.g. TP-BIZ-20418 — used for pay deep links. */
  code?: string;
  verified: boolean;
  location?: string;
  logoUrl?: string;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: Money;
  fee: Money;
  total: Money;
  status: TransactionStatus;
  merchant?: MerchantSummary;
  counterparty?: string;
  bookingRef?: string;
  method: PaymentMethodType;
  providerRef?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
}

export interface WalletBalance {
  currency: Currency;
  available: Money;
  pending: Money;
  held: Money;
  updatedAt: string;
}

export interface PaymentRequest {
  id: string;
  merchant: MerchantSummary;
  bookingRef: string;
  customerName?: string;
  customerContact?: string;
  /** Who absorbs the platform fee for this request. */
  feePayer?: "customer" | "business";
  amount: Money;
  description: string;
  createdAt: string;
  expiresAt: string;
  status: "open" | "paid" | "expired" | "cancelled";
}

/** Fees and totals always come from the (mock) API quote, never the UI. */
export interface PaymentQuote {
  quoteId: string;
  merchant: MerchantSummary;
  amount: Money;
  fee: Money;
  total: Money;
  /** Fee percentage behind `fee`; the UI renders a localized label from it. */
  feePct: number;
  expiresAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: Money;
  saved: Money;
  targetDate: string;
  suggestedMonthly: Money;
  status: "active" | "paused" | "completed";
  createdAt: string;
}

export interface RateQuote {
  pair: string;
  base: Currency;
  quote: Currency;
  rate: number;
  source: string;
  quotedAt: string;
  indicative: boolean;
  change24hPct: number;
}

export interface RateAlert {
  id: string;
  pair: string;
  targetRate: number;
  direction: "above" | "below";
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  verified: boolean;
  payoutMethod: { type: "mobile_money" | "bank"; last3: string };
  lastPaidAt?: string;
}

export interface Payout {
  id: string;
  supplier: Supplier;
  amount: Money;
  fee: Money;
  total: Money;
  status: TransactionStatus;
  needsSecondApproval: boolean;
  requestedBy?: string;
  /** Internal purchase-order style reference, e.g. PO-2026-0087. */
  ref?: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  reference: string;
  gross: Money;
  fees: Money;
  net: Money;
  transactionCount: number;
  period: string;
  expectedAt: string;
  status: "pending" | "settled" | "delayed";
}

export type UserRole =
  | "traveller"
  | "biz_owner"
  | "biz_finance"
  | "biz_staff"
  | "admin_support"
  | "admin_risk"
  | "admin_super";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  verificationStatus: "unverified" | "pending" | "approved" | "more_info";
  displayCurrency: Currency;
  country: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  code: string; // e.g. TP-BIZ-20418
  category: string;
  verified: boolean;
  location: string;
  verificationStatus: "unverified" | "pending" | "approved" | "more_info";
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "invited" | "suspended";
  lastActiveAt?: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  at: string;
}

export interface AppNotification {
  id: string;
  kind: "payment" | "security" | "savings" | "rates" | "system";
  titleKey: string;
  bodyKey: string;
  values?: Record<string, string>;
  createdAt: string;
  read: boolean;
}

export interface SupportCase {
  id: string;
  subject: string;
  status: "open" | "waiting" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface ProviderHealth {
  id: string;
  name: string; // neutral label, e.g. "Mobile money provider A"
  type: PaymentMethodType;
  status: "operational" | "degraded" | "down";
  successRatePct: number;
  pendingWebhooks: number;
  /** Webhook delivery p95 in milliseconds; null while the rail is down. */
  webhookP95Ms: number | null;
  lastIncidentAt?: string;
}

export interface ReconciliationRow {
  id: string;
  date: string;
  provider: string;
  ourCount: number;
  providerCount: number;
  ourTotal: Money;
  providerTotal: Money;
  status: "matched" | "mismatch" | "in_progress";
}

export interface DisputeCase {
  id: string;
  reference: string;
  customer: string; // masked by default in admin UI
  amount: Money;
  reason: string;
  status: "open" | "investigating" | "refunded" | "rejected";
  openedAt: string;
}

export interface BizStats {
  revenue: Money;
  transactionCount: number;
  successRatePct: number;
  pendingSettlement: Money;
  activeSuppliers: number;
  trend: { date: string; amountMinor: number }[];
}
