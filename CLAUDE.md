# TripPay frontend rules – always apply

## Core principles (apply to every page and feature)
1. **Simplicity & usability** – easy to understand, navigate and use.
2. **Reliability & availability** – consistent behaviour; every screen has loading/empty/error states, route-level error boundary and localized 404.
3. **Security & privacy** – protect accounts and personal data; mask PII, audit-log sensitive actions, baseline security headers in `next.config.ts`.
4. **Performance & speed** – fast loads, no unnecessary client code; verify with `pnpm build`.
5. **Accessibility** – WCAG AA, skip links, landmarks, focus rings, works across devices and abilities.
6. **Scalability** – modular structure (typed mock API layer, shared components) that supports more users, data and traffic.
7. **Consistency** – same layouts, colors (design tokens only), buttons, terminology and navigation everywhere; status via `StatusChip`, money via `MoneyAmount`.
8. **Responsive design** – the desktop-first web app must still work on phones and tablets: responsive grids, collapsible sidebars, horizontally scrollable tables, no fixed-width overflow. (This does not revive the disabled mobile-app shell.)
9. **Data integrity** – information stays accurate, complete and consistent: integer minor-unit money, API-quoted fees/totals, idempotent submits, en/sw message parity, seed data that adds up.

## Project
TripPay is a travel payments and money-management web app for tourists and tourism businesses in Tanzania. Tagline: "Built for Every Tourism Stakeholder – Travel • Pay • Explore."
Three apps in one codebase: traveller app (mobile-first), business portal (desktop-first), admin portal (internal, desktop only), plus a public marketing site and shared auth/onboarding.

This is a FRONTEND build. There is no real backend yet. All data comes from a typed mock API layer (`src/lib/api/*`, mock store in `src/lib/api/mock/`) that can later be swapped for real endpoints without changing UI components.

## Tech stack (do not substitute)
- Next.js (App Router) + TypeScript (strict), src dir, `@/*` alias
- Tailwind CSS v4 + shadcn/ui (`src/components/ui`) + lucide-react
- TanStack Query for data fetching/caching
- react-hook-form + zod for all forms and validation
- Recharts for charts
- next-intl for English (en) and Kiswahili (sw) — messages in `src/messages/`
- pnpm as package manager

## Brand & design tokens (defined in `src/app/globals.css`)
- brand red #E31E24 (primary buttons, active nav, "Pay" in wordmark, chart lines)
- black #0A0A0A (sidebars, heroes, headings); page bg #F5F5F5; card #FFFFFF; border #E5E5E5; muted #6B6B6B
- status: success #1E9E5A, pending #E8A317, failed #9B1C1C, info #2F6FDE, review #6B6B6B
- Red is the BRAND colour, not the error colour. Errors use #9B1C1C and ALWAYS include icon + text label. Never show status by colour alone (use `StatusChip`).
- Fonts: headings "Saira" (`font-heading`), body "Inter" — loaded via next/font. Use the `money` utility class (tabular-nums) for every amount.
- Radius: cards 16px (`rounded-xl`), inputs 12px (`rounded-lg`), buttons pill (`rounded-full`).
- Diagonal red/black motif (`DiagonalShape`/`HeroBanner`) only in heroes, onboarding, empty states.
- WCAG AA, focus rings, aria-labels on icon buttons, keyboard navigable, prefers-reduced-motion respected.

## Non-negotiable product rules
1. Money = integer minor units (`Money` type). TZS has 0 decimals; USD/EUR/GBP have 2. All formatting through `src/lib/money.ts`. Never float arithmetic for money.
2. Balances always show Available and Pending separately + "last updated" time. Pending is never spendable.
3. Before any payment/payout: show verified recipient name, amount, fee, total, then explicit confirm (`PaymentReview`).
4. Idempotency key (crypto.randomUUID) generated when review screen opens, sent with submit, confirm button disabled while submitting.
5. Timeout/slow response shows PENDING ("Don't pay again"), never "failed".
6. Every transaction shows a `StatusChip` + reference with copy button.
7. Fees/totals come from the (mock) API quote (`getPaymentQuote`), never computed in components. Frontend is never the authority for balances, fees, success or permissions.
8. Gated features (Travel Financing, Crypto, P2P, FX execution) via `src/lib/flags.ts` → show with `ComingSoonBadge` + explanation, never functional.
9. Never ask/display/log PINs or OTPs outside the dedicated OTP input. Show "TripPay will never ask for your PIN."
10. Admin: mask personal data by default (`src/lib/mask.ts`). Sensitive actions use `ReasonDialog` (reason required, audit-logged notice).
11. Role-based UI via `<Can permission="...">` (`src/components/auth/can.tsx`) driven by mock user role.

## Code quality
- Server components by default; `"use client"` only where needed.
- Every data screen has loading (skeleton), empty and error states.
- All user-facing strings through next-intl (`useTranslations`). Both en.json and sw.json must stay in sync — run the key-parity check in README.
- Components ≤ ~200 lines; split larger ones.
- Mock data realistic for Tanzania (TZS amounts, +255 phones, EAT timezone, merchant names like "Kilimanjaro Trails Ltd").
- No real payment-provider names/logos in UI — neutral "Mobile money", "Card", "Bank transfer".
- After each task, list files created/changed and remaining TODOs.

## Mock payment demo behaviour (`src/lib/api/payments.ts`)
Amount (major units) ending in **13** → failed; ending in **99** → stays pending (simulated provider timeout); otherwise successful. Same idempotency key always returns the original transaction.
