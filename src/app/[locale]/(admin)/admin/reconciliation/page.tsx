"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  getDailyReconciliation,
  listReconRuns,
  RECON_PROVIDERS,
} from "@/lib/api/admin";
import { formatDate, formatTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ExceptionsTable } from "./exceptions-table";

export default function AdminReconciliationPage() {
  const t = useTranslations("admin.reconciliation");
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState("2026-10-11");
  const [provider, setProvider] = useState<string>("Mobile money provider B");

  const recon = useQuery({
    queryKey: ["admin-daily-recon", date, provider],
    queryFn: () => getDailyReconciliation({ date, provider }),
  });
  const runs = useQuery({ queryKey: ["admin-recon-runs"], queryFn: listReconRuns });

  const balanced = recon.data ? recon.data.difference.amountMinor === 0 : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        action={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="sr-only"
              aria-label={t("upload")}
              onChange={(e) => {
                if (e.target.files?.length) {
                  toast.success(t("uploadToast", { file: e.target.files[0].name }));
                  e.target.value = "";
                }
              }}
            />
            <Button type="button" onClick={() => fileInputRef.current?.click()}>
              <Upload data-icon="inline-start" aria-hidden="true" />
              {t("upload")}
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="recon-date">{t("filters.date")}</Label>
          <Input
            id="recon-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="recon-provider">{t("filters.provider")}</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger id="recon-provider" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECON_PROVIDERS.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Totals */}
      {recon.isPending ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : recon.isError ? (
        <ErrorState onRetry={() => recon.refetch()} />
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5">
              <p className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                {t("tiles.ledger")}
              </p>
              <MoneyAmount
                money={recon.data.ledgerTotal}
                className="mt-1.5 block font-heading text-2xl font-bold"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t("tiles.entries", { count: recon.data.ledgerEntries.toLocaleString(locale) })}
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                {t("tiles.providerFile")}
              </p>
              <MoneyAmount
                money={recon.data.providerTotal}
                className="mt-1.5 block font-heading text-2xl font-bold"
              />
              <p className="money mt-1 text-xs text-muted-foreground">
                {t("tiles.lines", { count: recon.data.providerLines.toLocaleString(locale) })} ·{" "}
                {recon.data.fileName}
              </p>
            </div>
            <div
              className={cn(
                "rounded-2xl border p-5",
                balanced
                  ? "border-success/40 bg-success-soft"
                  : "border-pending bg-pending-soft",
              )}
            >
              <p
                className={cn(
                  "flex items-center gap-1.5 font-heading text-[11px] font-semibold tracking-widest uppercase",
                  balanced ? "text-success" : "text-pending",
                )}
              >
                {!balanced && <AlertTriangle className="size-3.5" aria-hidden="true" />}
                {balanced ? t("tiles.balanced") : t("tiles.difference")}
              </p>
              <MoneyAmount
                money={recon.data.difference}
                className={cn(
                  "mt-1.5 block font-heading text-2xl font-bold",
                  !balanced && "text-pending",
                )}
              />
              <p className={cn("mt-1 text-xs", balanced ? "text-success" : "text-pending")}>
                {balanced
                  ? t("tiles.balancedNote")
                  : t("tiles.exceptionsToResolve", { count: recon.data.exceptions.length })}
              </p>
            </div>
          </div>

          <ExceptionsTable exceptions={recon.data.exceptions} />
        </>
      )}

      {/* Run history */}
      <section aria-labelledby="runs-heading" className="rounded-2xl border bg-card">
        <h2 id="runs-heading" className="px-5 pt-5 font-heading text-lg font-bold">
          {t("runs.title")}
        </h2>
        <div className="mt-2 overflow-x-auto">
          {runs.isPending ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : runs.isError ? (
            <ErrorState className="m-5" onRetry={() => runs.refetch()} />
          ) : (
            <Table aria-label={t("runs.title")}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">{t("runs.columns.run")}</TableHead>
                  <TableHead>{t("runs.columns.date")}</TableHead>
                  <TableHead>{t("runs.columns.provider")}</TableHead>
                  <TableHead>{t("runs.columns.file")}</TableHead>
                  <TableHead>{t("runs.columns.result")}</TableHead>
                  <TableHead className="pr-5">{t("runs.columns.by")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.data.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="money pl-5">
                      {formatTime(run.ranAt, locale)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(run.date, locale)}
                    </TableCell>
                    <TableCell>{run.provider}</TableCell>
                    <TableCell className="money text-muted-foreground">{run.file}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          run.differences > 0
                            ? "bg-pending-soft text-pending"
                            : "bg-success-soft text-success",
                        )}
                      >
                        {run.differences > 0
                          ? t("runs.differences", { count: run.differences })
                          : t("runs.balanced")}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-muted-foreground">
                      {run.by ?? t("runs.auto")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">{t("correctionNote")}</p>
    </div>
  );
}
