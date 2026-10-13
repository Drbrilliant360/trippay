"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getBizStats, listBizTransactions } from "@/lib/api/business";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionRow } from "@/components/payments/transaction-row";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { VolumeChart } from "./volume-chart";

export default function BizDashboardPage() {
  const t = useTranslations("bizDashboard");
  const locale = useLocale();

  const stats = useQuery({ queryKey: ["biz-stats"], queryFn: getBizStats });
  const transactions = useQuery({
    queryKey: ["biz-transactions"],
    queryFn: listBizTransactions,
  });

  const tiles = stats.data
    ? [
        { key: "revenue", value: formatMoney(stats.data.revenue, locale) },
        { key: "count", value: String(stats.data.transactionCount) },
        { key: "successRate", value: `${stats.data.successRatePct.toFixed(1)}%` },
        {
          key: "pendingSettlement",
          value: formatMoney(stats.data.pendingSettlement, locale),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {stats.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : stats.isError ? (
        <ErrorState onRetry={() => stats.refetch()} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ key, value }) => (
            <Card key={key}>
              <CardContent className="p-4">
                <p className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                  {t(`tiles.${key}`)}
                </p>
                <p className="money mt-1.5 font-heading text-2xl font-bold">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(`tilesHint.${key}`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("chartTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.isPending ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : stats.isError ? (
            <ErrorState onRetry={() => stats.refetch()} />
          ) : (
            <VolumeChart trend={stats.data.trend} />
          )}
          <p className="mt-2 text-xs text-muted-foreground">{t("dataNote")}</p>
        </CardContent>
      </Card>

      <section aria-labelledby="biz-recent" className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 id="biz-recent" className="font-heading font-bold">
            {t("recentTitle")}
          </h2>
          <Link
            href="/biz/transactions"
            className="text-sm font-medium text-brand hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
        {transactions.isPending ? (
          <ListSkeleton rows={3} />
        ) : transactions.isError ? (
          <ErrorState onRetry={() => transactions.refetch()} />
        ) : (
          <div className="space-y-2">
            {transactions.data.slice(0, 4).map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} hrefBase="/biz/transactions" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
