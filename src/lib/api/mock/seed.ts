import type {
  AppNotification,
  AuditEntry,
  Business,
  BizStats,
  DisputeCase,
  MerchantSummary,
  PaymentRequest,
  Payout,
  ProviderHealth,
  RateAlert,
  RateQuote,
  ReconciliationRow,
  SavingsGoal,
  Settlement,
  StaffMember,
  SupportCase,
  Supplier,
  Transaction,
  User,
  WalletBalance,
} from "@/lib/types";

const now = Date.now();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

export const MERCHANTS: (MerchantSummary & { code: string })[] = [
  { id: "m1", code: "TP-BIZ-20418", name: "Kilimanjaro Trails Ltd", verified: true, location: "Moshi" },
  { id: "m2", code: "TP-BIZ-11205", name: "Zanzibar Spice Lodge", verified: true, location: "Stone Town" },
  { id: "m3", code: "TP-BIZ-33871", name: "Serengeti Guides Co.", verified: true, location: "Arusha" },
  { id: "m4", code: "TP-BIZ-45092", name: "Ngorongoro View Camp", verified: true, location: "Karatu" },
  { id: "m5", code: "TP-BIZ-58230", name: "Mwanza Lake Tours", verified: false, location: "Mwanza" },
];

export const TRAVELLER: User = {
  id: "u1",
  name: "Amani Mushi",
  email: "amani.mushi@example.com",
  phone: "+255 712 345 789",
  role: "traveller",
  verificationStatus: "approved",
  displayCurrency: "TZS",
  country: "TZ",
  createdAt: iso(90 * DAY),
};

export const BUSINESS: Business = {
  id: "b1",
  name: "Kilimanjaro Trails Ltd",
  code: "TP-BIZ-20418",
  category: "Tour operator",
  verified: true,
  location: "Moshi",
  verificationStatus: "approved",
};

export const BIZ_USER: User = {
  id: "u2",
  name: "Neema Shayo",
  email: "neema@kilitrails.co.tz",
  phone: "+255 754 820 416",
  role: "biz_owner",
  verificationStatus: "approved",
  displayCurrency: "TZS",
  country: "TZ",
  createdAt: iso(200 * DAY),
};

export const ADMIN_USER: User = {
  id: "u3",
  name: "Joseph Kessy",
  email: "joseph.kessy@trippay.internal",
  phone: "+255 629 114 207",
  role: "admin_super",
  verificationStatus: "approved",
  displayCurrency: "TZS",
  country: "TZ",
  createdAt: iso(400 * DAY),
};

export const WALLET_BALANCES: WalletBalance[] = [
  {
    currency: "TZS",
    available: { amountMinor: 2_340_500, currency: "TZS" },
    pending: { amountMinor: 180_000, currency: "TZS" },
    held: { amountMinor: 0, currency: "TZS" },
    updatedAt: iso(0.2 * HOUR),
  },
  {
    currency: "USD",
    available: { amountMinor: 42_050, currency: "USD" },
    pending: { amountMinor: 0, currency: "USD" },
    held: { amountMinor: 2_500, currency: "USD" },
    updatedAt: iso(0.2 * HOUR),
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    reference: "TP-8WQ3-55JR",
    type: "payment",
    direction: "out",
    amount: { amountMinor: 450_000, currency: "TZS" },
    fee: { amountMinor: 4_500, currency: "TZS" },
    total: { amountMinor: 454_500, currency: "TZS" },
    status: "successful",
    merchant: MERCHANTS[0],
    bookingRef: "KT-2026-0412",
    method: "mobile_money",
    providerRef: "MM-99201837",
    description: "Kilimanjaro day hike deposit",
    createdAt: iso(2 * HOUR),
    updatedAt: iso(1.9 * HOUR),
    timeline: [
      { status: "created", at: iso(2 * HOUR) },
      { status: "awaiting_authorisation", at: iso(1.98 * HOUR) },
      { status: "pending", at: iso(1.95 * HOUR) },
      { status: "successful", at: iso(1.9 * HOUR) },
    ],
  },
  {
    id: "t2",
    reference: "TP-2KD8-01MV",
    type: "payment",
    direction: "out",
    amount: { amountMinor: 1_250_000, currency: "TZS" },
    fee: { amountMinor: 12_500, currency: "TZS" },
    total: { amountMinor: 1_262_500, currency: "TZS" },
    status: "pending",
    merchant: MERCHANTS[2],
    bookingRef: "SG-2026-1180",
    method: "mobile_money",
    providerRef: "MM-99118204",
    description: "Serengeti 3-day safari balance",
    createdAt: iso(1 * DAY),
    updatedAt: iso(0.98 * DAY),
    timeline: [
      { status: "created", at: iso(1 * DAY) },
      { status: "awaiting_authorisation", at: iso(0.99 * DAY) },
      { status: "pending", at: iso(0.98 * DAY) },
    ],
  },
  {
    id: "t3",
    reference: "TP-7PL2-98XC",
    type: "top_up",
    direction: "in",
    amount: { amountMinor: 2_000_000, currency: "TZS" },
    fee: { amountMinor: 0, currency: "TZS" },
    total: { amountMinor: 2_000_000, currency: "TZS" },
    status: "successful",
    counterparty: "Mobile money top-up",
    method: "mobile_money",
    providerRef: "MM-98771623",
    createdAt: iso(3 * DAY),
    updatedAt: iso(3 * DAY - 0.1 * HOUR),
    timeline: [
      { status: "created", at: iso(3 * DAY) },
      { status: "pending", at: iso(3 * DAY - 0.05 * HOUR) },
      { status: "successful", at: iso(3 * DAY - 0.1 * HOUR) },
    ],
  },
  {
    id: "t4",
    reference: "TP-4RN6-22AH",
    type: "payment",
    direction: "out",
    amount: { amountMinor: 85_000, currency: "TZS" },
    fee: { amountMinor: 850, currency: "TZS" },
    total: { amountMinor: 85_850, currency: "TZS" },
    status: "failed",
    merchant: MERCHANTS[1],
    bookingRef: "ZS-2026-0077",
    method: "card",
    description: "Spice tour lunch",
    createdAt: iso(6 * DAY),
    updatedAt: iso(6 * DAY - 0.2 * HOUR),
    timeline: [
      { status: "created", at: iso(6 * DAY) },
      { status: "awaiting_authorisation", at: iso(6 * DAY - 0.1 * HOUR) },
      { status: "failed", at: iso(6 * DAY - 0.2 * HOUR) },
    ],
  },
  {
    id: "t5",
    reference: "TP-1GT9-40SZ",
    type: "refund",
    direction: "in",
    amount: { amountMinor: 85_000, currency: "TZS" },
    fee: { amountMinor: 0, currency: "TZS" },
    total: { amountMinor: 85_000, currency: "TZS" },
    status: "refunded",
    merchant: MERCHANTS[1],
    bookingRef: "ZS-2026-0077",
    method: "card",
    description: "Refund — Spice tour lunch",
    createdAt: iso(5 * DAY),
    updatedAt: iso(5 * DAY - 2 * HOUR),
    timeline: [
      { status: "created", at: iso(5 * DAY) },
      { status: "pending", at: iso(5 * DAY - HOUR) },
      { status: "refunded", at: iso(5 * DAY - 2 * HOUR) },
    ],
  },
  {
    id: "t6",
    reference: "TP-6MB4-73QW",
    type: "payment",
    direction: "out",
    amount: { amountMinor: 32_000, currency: "USD" },
    fee: { amountMinor: 320, currency: "USD" },
    total: { amountMinor: 32_320, currency: "USD" },
    status: "under_review",
    merchant: MERCHANTS[3],
    bookingRef: "NV-2026-0921",
    method: "bank_transfer",
    description: "Crater lodge deposit",
    createdAt: iso(9 * DAY),
    updatedAt: iso(9 * DAY - 3 * HOUR),
    timeline: [
      { status: "created", at: iso(9 * DAY) },
      { status: "pending", at: iso(9 * DAY - HOUR) },
      { status: "under_review", at: iso(9 * DAY - 3 * HOUR) },
    ],
  },
];

export const PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: "pr1",
    merchant: MERCHANTS[0],
    bookingRef: "KT-2026-0417",
    customerName: "Lukas Becker",
    customerContact: "lukas.b@example.com",
    feePayer: "customer",
    amount: { amountMinor: 235_000, currency: "USD" },
    description: "Kilimanjaro Machame, 7 days",
    createdAt: iso(5 * HOUR),
    expiresAt: new Date(now + 19 * HOUR).toISOString(),
    status: "open",
  },
  {
    id: "pr2",
    merchant: MERCHANTS[0],
    bookingRef: "KT-2026-0412",
    customerName: "David Mwangi",
    customerContact: "+255 754 123 456",
    feePayer: "customer",
    amount: { amountMinor: 1_250_000, currency: "TZS" },
    description: "Day hike, Materuni falls",
    createdAt: iso(2.2 * HOUR),
    expiresAt: new Date(now + 10 * HOUR).toISOString(),
    status: "paid",
  },
  {
    id: "pr3",
    merchant: MERCHANTS[0],
    bookingRef: "KT-2026-0398",
    customerName: "Priya Nair",
    feePayer: "business",
    amount: { amountMinor: 42_000, currency: "USD" },
    description: "Tarangire day trip",
    createdAt: iso(4 * DAY),
    expiresAt: iso(3 * DAY),
    status: "expired",
  },
  {
    id: "pr4",
    merchant: MERCHANTS[0],
    bookingRef: "KT-2026-0391",
    customerName: "Tom Okafor",
    feePayer: "customer",
    amount: { amountMinor: 6_000, currency: "USD" },
    description: "Airport transfer",
    createdAt: iso(5 * DAY),
    expiresAt: iso(4 * DAY),
    status: "cancelled",
  },
];

export const SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: "sg1",
    name: "Serengeti safari",
    target: { amountMinor: 4_500_000, currency: "TZS" },
    saved: { amountMinor: 2_610_000, currency: "TZS" },
    targetDate: new Date(now + 75 * DAY).toISOString(),
    suggestedMonthly: { amountMinor: 756_000, currency: "TZS" },
    status: "active",
    createdAt: iso(60 * DAY),
  },
  {
    id: "sg2",
    name: "Zanzibar beach week",
    target: { amountMinor: 9_000_000, currency: "TZS" },
    saved: { amountMinor: 900_000, currency: "TZS" },
    targetDate: new Date(now + 140 * DAY).toISOString(),
    suggestedMonthly: { amountMinor: 1_620_000, currency: "TZS" },
    status: "paused",
    createdAt: iso(30 * DAY),
  },
];

export const RATES: RateQuote[] = [
  { pair: "USD/TZS", base: "USD", quote: "TZS", rate: 2615.4, source: "Indicative market feed", quotedAt: iso(0.1 * HOUR), indicative: true, change24hPct: 0.24 },
  { pair: "EUR/TZS", base: "EUR", quote: "TZS", rate: 2854.1, source: "Indicative market feed", quotedAt: iso(0.1 * HOUR), indicative: true, change24hPct: -0.31 },
  { pair: "GBP/TZS", base: "GBP", quote: "TZS", rate: 3322.75, source: "Indicative market feed", quotedAt: iso(0.1 * HOUR), indicative: true, change24hPct: 0.08 },
];

export const RATE_ALERTS: RateAlert[] = [
  { id: "ra1", pair: "USD/TZS", targetRate: 2650, direction: "above", active: true },
];

export const SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Joseph Lyimo", category: "Guide", phone: "+255 713 402 918", verified: true, payoutMethod: { type: "mobile_money", last3: "456" }, lastPaidAt: iso(10 * DAY) },
  { id: "s2", name: "Baraka Transfers", category: "Driver", phone: "+255 765 118 230", verified: true, payoutMethod: { type: "bank", last3: "209" }, lastPaidAt: iso(15 * DAY) },
  { id: "s3", name: "Ndutu Tented Lodge", category: "Lodge", phone: "+255 744 903 551", verified: true, payoutMethod: { type: "bank", last3: "530" }, lastPaidAt: iso(23 * DAY) },
  { id: "s4", name: "Mama Rehema Catering", category: "Vendor", phone: "+255 718 276 004", verified: false, payoutMethod: { type: "mobile_money", last3: "118" } },
];

export const PAYOUTS: Payout[] = [
  {
    id: "po1",
    supplier: SUPPLIERS[1],
    amount: { amountMinor: 850_000, currency: "TZS" },
    fee: { amountMinor: 4_250, currency: "TZS" },
    total: { amountMinor: 854_250, currency: "TZS" },
    status: "successful",
    needsSecondApproval: false,
    requestedBy: "Neema Kimaro",
    ref: "PO-2026-0081",
    createdAt: iso(4 * DAY),
  },
  {
    id: "po2",
    supplier: SUPPLIERS[2],
    amount: { amountMinor: 145_000, currency: "USD" },
    fee: { amountMinor: 725, currency: "USD" },
    total: { amountMinor: 145_725, currency: "USD" },
    status: "awaiting_authorisation",
    needsSecondApproval: true,
    requestedBy: "Neema Kimaro",
    ref: "PO-2026-0087",
    createdAt: iso(0.2 * DAY),
  },
  {
    id: "po3",
    supplier: SUPPLIERS[0],
    amount: { amountMinor: 850_000, currency: "TZS" },
    fee: { amountMinor: 4_250, currency: "TZS" },
    total: { amountMinor: 854_250, currency: "TZS" },
    status: "awaiting_authorisation",
    needsSecondApproval: true,
    requestedBy: "Peter Mushi",
    ref: "PO-2026-0086",
    createdAt: iso(0.25 * DAY),
  },
];

export const SETTLEMENTS: Settlement[] = [
  {
    id: "st1",
    reference: "SET-2026-1012",
    gross: { amountMinor: 8_430_000, currency: "TZS" },
    fees: { amountMinor: 84_300, currency: "TZS" },
    net: { amountMinor: 8_345_700, currency: "TZS" },
    transactionCount: 23,
    period: "10–11 Oct 2026",
    expectedAt: new Date(now + 1 * DAY).toISOString(),
    status: "pending",
  },
  {
    id: "st2",
    reference: "SET-2026-1010",
    gross: { amountMinor: 12_190_000, currency: "TZS" },
    fees: { amountMinor: 121_900, currency: "TZS" },
    net: { amountMinor: 12_068_100, currency: "TZS" },
    transactionCount: 31,
    period: "8–9 Oct 2026",
    expectedAt: iso(1 * DAY),
    status: "settled",
  },
  {
    id: "st3",
    reference: "SET-2026-1008",
    gross: { amountMinor: 6_540_000, currency: "TZS" },
    fees: { amountMinor: 65_400, currency: "TZS" },
    net: { amountMinor: 6_474_600, currency: "TZS" },
    transactionCount: 17,
    period: "6–7 Oct 2026",
    expectedAt: iso(3 * DAY),
    status: "settled",
  },
];

export const STAFF: StaffMember[] = [
  { id: "sm1", name: "Neema Shayo", email: "neema@kilitrails.co.tz", role: "biz_owner", status: "active", lastActiveAt: iso(0.1 * HOUR) },
  { id: "sm2", name: "Baraka Temu", email: "baraka@kilitrails.co.tz", role: "biz_finance", status: "active", lastActiveAt: iso(5 * HOUR) },
  { id: "sm3", name: "Grace Mallya", email: "grace@kilitrails.co.tz", role: "biz_staff", status: "invited" },
];

export const BIZ_STATS: BizStats = {
  revenue: { amountMinor: 27_160_000, currency: "TZS" },
  transactionCount: 71,
  successRatePct: 96.2,
  pendingSettlement: { amountMinor: 8_345_700, currency: "TZS" },
  activeSuppliers: 3,
  trend: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(now - (13 - i) * DAY).toISOString(),
    amountMinor: [1.2, 0.9, 1.7, 2.1, 1.4, 0.6, 1.1, 2.4, 1.9, 1.3, 2.8, 2.2, 1.6, 2.0][i] * 1_000_000,
  })),
};

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "payment", titleKey: "paymentSuccessTitle", bodyKey: "paymentSuccessBody", values: { amount: "TZS 454,500", merchant: "Kilimanjaro Trails Ltd" }, createdAt: iso(1.9 * HOUR), read: false },
  { id: "n2", kind: "payment", titleKey: "paymentPendingTitle", bodyKey: "paymentPendingBody", values: { amount: "TZS 1,262,500", merchant: "Serengeti Guides Co." }, createdAt: iso(0.95 * DAY), read: false },
  { id: "n3", kind: "savings", titleKey: "savingsMilestoneTitle", bodyKey: "savingsMilestoneBody", values: { goal: "Serengeti safari", pct: "58" }, createdAt: iso(2 * DAY), read: true },
  { id: "n4", kind: "security", titleKey: "newSignInTitle", bodyKey: "newSignInBody", values: { device: "Safari on macOS" }, createdAt: iso(4 * DAY), read: true },
];

export const SUPPORT_CASES: SupportCase[] = [
  { id: "CS-10452", subject: "Payment stuck on pending", status: "waiting", createdAt: iso(0.9 * DAY), updatedAt: iso(0.2 * DAY) },
  { id: "CS-10311", subject: "Update passport details", status: "resolved", createdAt: iso(12 * DAY), updatedAt: iso(10 * DAY) },
];

export const PROVIDERS: ProviderHealth[] = [
  { id: "pv1", name: "Mobile money provider A", type: "mobile_money", status: "operational", successRatePct: 97.4, pendingWebhooks: 2, webhookP95Ms: 420 },
  { id: "pv2", name: "Mobile money provider B", type: "mobile_money", status: "degraded", successRatePct: 88.1, pendingWebhooks: 14, webhookP95Ms: 6_800, lastIncidentAt: iso(0.1 * DAY) },
  { id: "pv3", name: "Card processor", type: "card", status: "operational", successRatePct: 98.2, pendingWebhooks: 1, webhookP95Ms: 610 },
  { id: "pv4", name: "Bank transfer rail", type: "bank_transfer", status: "down", successRatePct: 0, pendingWebhooks: 0, webhookP95Ms: null, lastIncidentAt: iso(0.07 * DAY) },
];

export const RECONCILIATION: ReconciliationRow[] = [
  { id: "rc1", date: iso(1 * DAY), provider: "Mobile money aggregator", ourCount: 214, providerCount: 214, ourTotal: { amountMinor: 54_120_000, currency: "TZS" }, providerTotal: { amountMinor: 54_120_000, currency: "TZS" }, status: "matched" },
  { id: "rc2", date: iso(1 * DAY), provider: "Card processor", ourCount: 48, providerCount: 47, ourTotal: { amountMinor: 9_830_000, currency: "TZS" }, providerTotal: { amountMinor: 9_745_000, currency: "TZS" }, status: "mismatch" },
  { id: "rc3", date: iso(0.2 * DAY), provider: "Bank transfer rail", ourCount: 12, providerCount: 12, ourTotal: { amountMinor: 18_400_000, currency: "TZS" }, providerTotal: { amountMinor: 18_400_000, currency: "TZS" }, status: "in_progress" },
];

export const DISPUTES: DisputeCase[] = [
  { id: "dp1", reference: "TP-4RN6-22AH", customer: "+255 712 345 789", amount: { amountMinor: 85_850, currency: "TZS" }, reason: "Charged but booking not confirmed", status: "investigating", openedAt: iso(5 * DAY) },
  { id: "dp2", reference: "TP-9QF1-30TK", customer: "+255 782 019 455", amount: { amountMinor: 220_000, currency: "TZS" }, reason: "Duplicate charge reported", status: "open", openedAt: iso(1.5 * DAY) },
];

export const VERIFICATION_QUEUE: { id: string; name: string; type: "traveller" | "business"; submittedAt: string; status: "pending" | "more_info"; phone: string }[] = [
  { id: "vq1", name: "Mwanza Lake Tours", type: "business", submittedAt: iso(2 * DAY), status: "pending", phone: "+255 755 301 882" },
  { id: "vq2", name: "Fatma Hassan", type: "traveller", submittedAt: iso(0.8 * DAY), status: "pending", phone: "+255 716 902 347" },
  { id: "vq3", name: "Arusha Cultural Treks", type: "business", submittedAt: iso(4 * DAY), status: "more_info", phone: "+255 762 445 019" },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: "a1", actor: "Joseph Kessy", actorRole: "admin_super", action: "refund.issued", targetType: "transaction", targetId: "TP-4RN6-22AH", reason: "Failed card charge, customer refunded", at: iso(5 * DAY) },
  { id: "a2", actor: "Asha Mbwana", actorRole: "admin_risk", action: "verification.approved", targetType: "business", targetId: "TP-BIZ-45092", reason: "Documents verified against registry", at: iso(3 * DAY) },
  { id: "a3", actor: "Joseph Kessy", actorRole: "admin_super", action: "config.fee_changed", targetType: "config", targetId: "fee.mobile_money", reason: "Quarterly pricing review", at: iso(1 * DAY) },
];
