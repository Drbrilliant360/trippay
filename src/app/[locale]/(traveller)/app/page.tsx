"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  CircleDollarSign,
  LineChart,
  PiggyBank,
  ReceiptText,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getWalletBalances } from "@/lib/api/wallet";
import { listTransactions } from "@/lib/api/transactions";
import { listOpenPaymentRequests } from "@/lib/api/payments";
import { formatDateTime } from "@/lib/datetime";
import { useCurrentUser } from "@/components/auth/role-provider";
import { BalanceCard } from "@/components/money/balance-card";
import { MoneyAmount } from "@/components/money/money-amount";
import { TransactionRow } from "@/components/payments/transaction-row";
import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";

const ACTIONS = [
  { href: "/app/pay", key: "pay", icon: CircleDollarSign },
  { href: "/app/savings", key: "savings", icon: PiggyBank },
  { href: "/app/rates", key: "rates", icon: LineChart },
  { href: "/app/transfer", key: "transfer", icon: ArrowLeftRight },
] as const;

export default function HomePage() {
  const t = useTranslations("home");
  const tw = useTranslations("wallet");
  const locale = useLocale();
  const user = useCurrentUser();

  const balances = useQuery({ queryKey: ["balances"], queryFn: getWalletBalances });
  const recent = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => listTransactions(),
  });
  const requests = useQuery({
    queryKey: ["payment-requests"],
    queryFn: listOpenPaymentRequests,
  });

  const primaryBalance = balances.data?.[0];
  const otherBalances = balances.data?.slice(1) ?? [];
  const openRequests = requests.data?.filter((r) => r.status === "open") ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">
        {t("greeting", { name: user?.name.split(" ")[0] ?? "…" })}
      </h1>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          {balances.isPending ? (
            <Skeleton className="h-44 w-full rounded-2xl" />
          ) : balances.isError ? (
            <ErrorState onRetry={() => balances.refetch()} />
          ) : primaryBalance ? (
            <BalanceCard balance={primaryBalance} emphasis />
          ) : null}

          {openRequests.length > 0 && (
            <section aria-labelledby="requests-heading" className="space-y-2">
              <h2 id="requests-heading" className="font-heading font-bold">
                {t("requestsTitle")}
              </h2>
              {openRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/app/pay?code=${request.merchant.code ?? request.merchant.name}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-brand/40 bg-card p-4 transition-colors hover:border-brand"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{request.merchant.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {request.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <MoneyAmount money={request.amount} className="text-sm font-semibold" />
                    <Badge className="bg-brand/10 text-brand">{t("payNow")}</Badge>
                  </div>
                </Link>
              ))}
            </section>
          )}

          <section aria-labelledby="recent-heading" className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 id="recent-heading" className="font-heading font-bold">
                {t("recentTitle")}
              </h2>
              <Link
                href="/app/transactions"
                className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                {t("viewAll")}
                <ReceiptText className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            {recent.isPending ? (
              <ListSkeleton rows={5} />
            ) : recent.isError ? (
              <ErrorState onRetry={() => recent.refetch()} />
            ) : (
              <div className="space-y-2">
                {recent.data.slice(0, 5).map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <nav
            aria-label={t("quickActions")}
            className="grid grid-cols-4 gap-2 lg:grid-cols-2"
          >
            {ACTIONS.map(({ href, key, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                className="group flex flex-col items-center gap-1.5 rounded-2xl border bg-card p-3 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md lg:flex-row lg:gap-2.5 lg:p-4 lg:text-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                {t(`actions.${key}`)}
              </Link>
            ))}
          </nav>

          {otherBalances.length > 0 && (
            <section aria-labelledby="other-balances-heading" className="space-y-2">
              <h2 id="other-balances-heading" className="font-heading font-bold">
                {t("otherBalances")}
              </h2>
              {otherBalances.map((balance) => (
                <Link
                  key={balance.currency}
                  href="/app/wallet"
                  className="block rounded-2xl border bg-card p-4 transition-colors hover:border-ink/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{balance.currency}</span>
                    <MoneyAmount
                      money={balance.available}
                      className="font-heading font-bold"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tw("pending")}: <MoneyAmount money={balance.pending} />
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {tw("updated", { time: formatDateTime(balance.updatedAt, locale) })}
                  </p>
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
