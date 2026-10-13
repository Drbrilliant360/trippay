"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import type { Money } from "@/lib/types";
import { getReconciliationReport, type ReconFilters } from "@/lib/api/business";
import { CURRENCY_DECIMALS, formatMoney } from "@/lib/money";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ReconTable } from "./recon-table";

const TILE_KEYS = ["gross", "refunds", "fees", "net", "settled", "pending"] as const;
const NEGATIVE_TILES = new Set(["refunds", "fees"]);

export default function BizReportsPage() {
  const t = useTranslations("bizReports");
  const locale = useLocale();
  const [filters, setFilters] = useState<ReconFilters>({
    rangeDays: 30,
    status: "all",
    method: "all",
  });

  const report = useQuery({
    queryKey: ["biz-recon", filters],
    queryFn: () => getReconciliationReport(filters),
  });

  function downloadCsv() {
    if (!report.data) return;
    // Quote any field containing a comma, quote or newline (RFC 4180).
    const csv = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
    const header = "reference,bookingRef,customer,date,currency,gross,fee,status,method,matched";
    const lines = report.data.rows.map((row) => {
      const factor = 10 ** CURRENCY_DECIMALS[row.gross.currency];
      return [
        row.reference,
        row.bookingRef ?? "",
        row.customer ?? "",
        row.createdAt,
        row.gross.currency,
        (row.gross.amountMinor / factor).toFixed(CURRENCY_DECIMALS[row.gross.currency]),
        (row.fee.amountMinor / factor).toFixed(CURRENCY_DECIMALS[row.fee.currency]),
        row.status,
        row.method,
        row.matched ? "yes" : "no",
      ]
        .map(csv)
        .join(",");
    });
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trippay-reconciliation-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        action={
          <Can permission="biz.reports.export">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={downloadCsv} disabled={!report.data}>
                <Download data-icon="inline-start" aria-hidden="true" />
                {t("exportCsv")}
              </Button>
              <Button
                type="button"
                className="bg-ink text-white hover:bg-ink/85"
                onClick={() => window.print()}
                disabled={!report.data}
              >
                <FileText data-icon="inline-start" aria-hidden="true" />
                {t("exportPdf")}
              </Button>
            </div>
          </Can>
        }
      />

      {/* Filters */}
      <div className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-5">
        <FilterField label={t("filters.dateRange")}>
          <Select
            value={String(filters.rangeDays)}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, rangeDays: Number(v) as ReconFilters["rangeDays"] }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[7, 30, 90].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {t(`filters.ranges.d${d}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("filters.timezone")}>
          <Select value="eat" disabled>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eat">{t("filters.tzEat")}</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("filters.currency")}>
          <Select value="usd" disabled>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">{t("filters.currencyUsd")}</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("filters.status")}>
          <Select
            value={filters.status}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, status: v as ReconFilters["status"] }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["all", "settled", "pending", "refunded"] as const).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`filters.statuses.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("filters.method")}>
          <Select
            value={filters.method}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, method: v as ReconFilters["method"] }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["all", "mobile_money", "card", "bank"] as const).map((m) => (
                <SelectItem key={m} value={m}>
                  {t(`filters.methods.${m}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      {/* Summary tiles */}
      {report.isPending ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TILE_KEYS.map((key) => (
            <Skeleton key={key} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : report.isError ? (
        <ErrorState onRetry={() => report.refetch()} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TILE_KEYS.map((key) => (
              <SummaryTile
                key={key}
                label={t(`tiles.${key}`)}
                money={report.data.summary[key]}
                emphasized={key === "net"}
                negative={NEGATIVE_TILES.has(key)}
                pendingTone={key === "pending"}
                locale={locale}
              />
            ))}
          </div>

          <ReconTable rows={report.data.rows} unmatchedCount={report.data.unmatchedCount} />

          {/* Definitions */}
          <section
            aria-labelledby="definitions-heading"
            className="rounded-2xl border bg-card p-5 sm:p-6"
          >
            <h2
              id="definitions-heading"
              className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase"
            >
              {t("definitions.title")}
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(["period", "grossNet", "refunds", "currency"] as const).map((key) => (
                <div key={key}>
                  <h3 className="text-sm font-semibold">{t(`definitions.${key}.title`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`definitions.${key}.body`)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  money,
  emphasized,
  negative,
  pendingTone,
  locale,
}: {
  label: string;
  money: Money;
  emphasized: boolean;
  negative: boolean;
  pendingTone: boolean;
  locale: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        emphasized ? "border-ink bg-ink text-white" : "bg-card",
      )}
    >
      <p
        className={cn(
          "font-heading text-[11px] font-semibold tracking-widest uppercase",
          emphasized
            ? "text-white/60"
            : pendingTone
              ? "text-pending"
              : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="money mt-1.5 font-heading text-xl font-bold">
        {negative && money.amountMinor > 0 ? "−" : ""}
        {formatMoney(money, locale)}
      </p>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}
