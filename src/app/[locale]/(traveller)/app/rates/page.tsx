"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, BellRing, TrendingDown, TrendingUp } from "lucide-react";
import { getRateHistory, listRateAlerts, listRates } from "@/lib/api/rates";
import { formatDateTime } from "@/lib/datetime";
import { flags } from "@/lib/flags";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { ComingSoonBadge } from "@/components/status/coming-soon-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RateChart } from "./rate-chart";

export default function RatesPage() {
  const t = useTranslations("rates");
  const locale = useLocale();
  const [pair, setPair] = useState("USD/TZS");

  const rates = useQuery({ queryKey: ["rates"], queryFn: listRates });
  const alerts = useQuery({ queryKey: ["rate-alerts"], queryFn: listRateAlerts });
  const history = useQuery({
    queryKey: ["rate-history", pair],
    queryFn: () => getRateHistory(pair),
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {rates.isPending ? (
        <ListSkeleton rows={3} rowClassName="h-28" />
      ) : rates.isError ? (
        <ErrorState onRetry={() => rates.refetch()} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {rates.data.map((rate) => {
              const up = rate.change24hPct >= 0;
              return (
                <Card key={rate.pair}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-heading font-bold">{rate.pair}</p>
                      <p
                        className={`flex items-center gap-1 text-xs font-medium ${
                          up ? "text-success" : "text-failed"
                        }`}
                      >
                        {up ? (
                          <TrendingUp className="size-3.5" aria-hidden="true" />
                        ) : (
                          <TrendingDown className="size-3.5" aria-hidden="true" />
                        )}
                        {up ? "+" : ""}
                        {rate.change24hPct.toFixed(2)}%
                      </p>
                    </div>
                    <p className="money mt-2 font-heading text-2xl font-bold">
                      {new Intl.NumberFormat(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(rate.rate)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {rate.indicative ? t("indicative") : t("guaranteed")} ·{" "}
                      {formatDateTime(rate.quotedAt, locale)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading font-bold">{t("chartTitle")}</h2>
                <Tabs value={pair} onValueChange={setPair}>
                  <TabsList>
                    {rates.data.map((rate) => (
                      <TabsTrigger key={rate.pair} value={rate.pair}>
                        {rate.pair}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              {history.isPending ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : history.isError ? (
                <ErrorState onRetry={() => history.refetch()} />
              ) : (
                <RateChart pair={pair} history={history.data} />
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">{t("sourceNote")}</p>
        </>
      )}

      {flags.currencyAlerts && (
        <section aria-labelledby="alerts-heading" className="space-y-2">
          <h2 id="alerts-heading" className="font-heading font-bold">
            {t("alertsTitle")}
          </h2>
          {alerts.isPending ? (
            <ListSkeleton rows={1} rowClassName="h-16" />
          ) : alerts.isError ? (
            <ErrorState onRetry={() => alerts.refetch()} />
          ) : (
            alerts.data.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-2">
                    <BellRing className="size-4 text-brand" aria-hidden="true" />
                    <p className="text-sm font-medium">
                      {t("alertRow", {
                        pair: alert.pair,
                        direction: t(`direction.${alert.direction}`),
                        rate: alert.targetRate,
                      })}
                    </p>
                  </div>
                  <Badge className={alert.active ? "bg-success-soft text-success" : ""}>
                    {alert.active ? t("alertActive") : t("alertPaused")}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
          <p className="text-xs text-muted-foreground">{t("alertsNote")}</p>
        </section>
      )}

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <ArrowLeftRight
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-bold">{t("exchange.title")}</h2>
              {!flags.currencyExchangeExecution && <ComingSoonBadge />}
            </div>
            <p className="text-sm text-muted-foreground">{t("exchange.body")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
