"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Check } from "lucide-react";
import type { ReconRow } from "@/lib/api/business";
import { Can } from "@/components/auth/can";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MatchDialog } from "./match-dialog";

interface ReconTableProps {
  rows: ReconRow[];
  unmatchedCount: number;
}

/** Transactions matched to bookings; unmatched rows carry the amber marker. */
export function ReconTable({ rows, unmatchedCount }: ReconTableProps) {
  const t = useTranslations("bizReports.table");

  return (
    <section aria-labelledby="recon-heading" className="rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <h2 id="recon-heading" className="font-heading text-lg font-bold">
          {t("title")}
        </h2>
        {unmatchedCount > 0 && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-pending-soft px-2.5 py-1 text-xs font-medium text-pending">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            {t("unmatchedCount", { count: unmatchedCount })}
          </p>
        )}
      </div>
      <div className="mt-2 overflow-x-auto">
        <Table aria-label={t("title")}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">{t("reference")}</TableHead>
              <TableHead>{t("bookingRef")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead className="text-right">{t("gross")}</TableHead>
              <TableHead className="text-right">{t("fee")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("match")}</TableHead>
              <TableHead className="pr-5 text-right">
                <span className="sr-only">{t("actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  !row.matched &&
                    "border-l-4 border-l-pending bg-pending-soft/40 hover:bg-pending-soft/60",
                )}
              >
                <TableCell className={cn("money", row.matched ? "pl-5" : "pl-4")}>
                  {row.reference}
                </TableCell>
                <TableCell className="money text-muted-foreground">
                  {row.bookingRef ?? "—"}
                </TableCell>
                <TableCell>{row.customer ?? t("walkIn")}</TableCell>
                <TableCell className="text-right">
                  <MoneyAmount money={row.gross} className="font-medium" />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  <MoneyAmount money={row.fee} />
                </TableCell>
                <TableCell>
                  <StatusChip status={row.status} />
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      row.matched
                        ? "bg-success-soft text-success"
                        : "bg-pending-soft text-pending",
                    )}
                  >
                    {row.matched ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                    )}
                    {row.matched ? t("matched") : t("unmatched")}
                  </span>
                </TableCell>
                <TableCell className="pr-5 text-right">
                  {!row.matched && (
                    <Can permission="biz.reports.export">
                      <MatchDialog row={row} />
                    </Can>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
