"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAdminOverview, listProviders } from "@/lib/api/admin";
import { formatDateTime, formatTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { StatusChip } from "@/components/status/status-chip";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/motion/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TxSearch } from "./tx-search";

const DOT_BY_STATUS = {
  operational: "bg-success",
  degraded: "bg-pending",
  down: "bg-failed",
} as const;

export default function AdminOverviewPage() {
  const t = useTranslations("admin.overview");
  const locale = useLocale();
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: getAdminOverview });
  const providers = useQuery({ queryKey: ["admin-providers"], queryFn: listProviders });

  const tiles = overview.data
    ? ([
        { key: "paymentsToday", value: overview.data.paymentsToday, href: "/admin/transactions" },
        { key: "successRate", value: overview.data.successRatePct, decimals: 1, suffix: "%", href: "/admin/providers" },
        { key: "failed", value: overview.data.failedToday, href: "/admin/transactions" },
        { key: "pendingOver15", value: overview.data.pendingOver15m, href: "/admin/transactions", attention: true },
        { key: "openCases", value: overview.data.openCases, href: "/admin/disputes" },
        { key: "riskFlags", value: overview.data.riskFlags, href: "/admin/disputes" },
      ] as const)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={formatDateTime(new Date().toISOString(), locale) + " EAT"}
      />

      {/* Stat tiles */}
      {overview.isPending ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : overview.isError ? (
        <ErrorState onRetry={() => overview.refetch()} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <Link key={tile.key} href={tile.href}>
              <Card
                className={cn(
                  "h-full transition-colors hover:border-ink/40",
                  "attention" in tile && tile.attention && "border-pending",
                )}
              >
                <CardContent className="p-4">
                  <p
                    className={cn(
                      "font-heading text-[11px] font-semibold tracking-widest uppercase",
                      "attention" in tile && tile.attention
                        ? "text-pending"
                        : "text-muted-foreground",
                    )}
                  >
                    {t(`tiles.${tile.key}`)}
                  </p>
                  <CountUp
                    value={tile.value}
                    decimals={"decimals" in tile ? tile.decimals : 0}
                    suffix={"suffix" in tile ? tile.suffix : ""}
                    className="money mt-1.5 block font-heading text-2xl font-bold"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Provider health + reconciliation */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="health-heading" className="rounded-2xl border bg-card p-5">
          <h2 id="health-heading" className="font-heading text-lg font-bold">
            {t("health.title")}
          </h2>
          {providers.isPending ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : providers.isError ? (
            <ErrorState className="mt-4" onRetry={() => providers.refetch()} />
          ) : (
            <ul className="mt-2 divide-y">
              {providers.data.map((provider) => (
                <li
                  key={provider.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <p className="flex items-center gap-2.5 text-sm font-medium">
                    <span
                      className={cn("size-2 rounded-full", DOT_BY_STATUS[provider.status])}
                      aria-hidden="true"
                    />
                    {provider.name}
                  </p>
                  <div className="flex items-center gap-4">
                    <StatusChip status={provider.status} />
                    <p
                      className={cn(
                        "w-40 text-right text-sm",
                        provider.status === "degraded" && "font-semibold text-pending",
                        provider.status === "down" && "font-semibold text-failed",
                        provider.status === "operational" && "text-muted-foreground",
                      )}
                    >
                      {provider.status === "down"
                        ? t("health.noWebhooks")
                        : t("health.webhookP95", {
                            value:
                              provider.webhookP95Ms! >= 1000
                                ? `${(provider.webhookP95Ms! / 1000).toFixed(1)} s`
                                : `${provider.webhookP95Ms} ms`,
                          })}
                    </p>
                  </div>
                  {provider.status === "down" && provider.lastIncidentAt && (
                    <p className="w-full pl-4.5 text-xs font-medium text-failed">
                      {t("health.downSince", {
                        time: formatTime(provider.lastIncidentAt, locale),
                      })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recon-heading" className="rounded-2xl border bg-card p-5">
          <h2 id="recon-heading" className="font-heading text-lg font-bold">
            {t("recon.title")}
          </h2>
          {overview.data ? (
            <>
              <p className="mt-3 text-sm">
                {t("recon.yesterday")}{" "}
                <span className="font-semibold">
                  {t("recon.matched", {
                    count: overview.data.recon.matched.toLocaleString(locale),
                  })}
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-pending">
                  {t("recon.differences", { count: overview.data.recon.differences })}
                </span>
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pending-soft px-2.5 py-1 text-xs font-medium text-pending">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                {t("recon.needsReview")}
              </p>
              <p className="mt-6">
                <Link
                  href="/admin/reconciliation"
                  className="text-sm font-medium text-brand underline underline-offset-4 hover:no-underline"
                >
                  {t("recon.open")}
                </Link>
              </p>
            </>
          ) : (
            <Skeleton className="mt-3 h-24 rounded-xl" />
          )}
        </section>
      </div>

      <TxSearch />

      <p className="text-xs text-muted-foreground">{t("maskingNote")}</p>
    </div>
  );
}
