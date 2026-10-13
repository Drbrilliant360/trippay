"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import { listBizTransactions } from "@/lib/api/business";
import { formatDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { CopyButton } from "@/components/shared/copy-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BizTransactionsPage() {
  const t = useTranslations("bizTransactions");
  const locale = useLocale();

  const transactions = useQuery({
    queryKey: ["biz-transactions"],
    queryFn: listBizTransactions,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {transactions.isPending ? (
        <ListSkeleton rows={5} rowClassName="h-12" />
      ) : transactions.isError ? (
        <ErrorState onRetry={() => transactions.refetch()} />
      ) : transactions.data.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.reference")}</TableHead>
                <TableHead>{t("columns.booking")}</TableHead>
                <TableHead>{t("columns.date")}</TableHead>
                <TableHead className="text-right">{t("columns.amount")}</TableHead>
                <TableHead className="text-right">{t("columns.fee")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.data.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <span className="flex items-center gap-1 font-mono text-xs">
                      {tx.reference}
                      <CopyButton value={tx.reference} />
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.bookingRef ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDateTime(tx.createdAt, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyAmount money={tx.amount} className="text-sm font-medium" />
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyAmount money={tx.fee} className="text-xs text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={tx.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
