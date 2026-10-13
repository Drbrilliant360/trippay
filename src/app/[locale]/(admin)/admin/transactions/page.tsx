"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ScanSearch, Search } from "lucide-react";
import { searchTransactions } from "@/lib/api/admin";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { formatDateTime } from "@/lib/datetime";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminTransactionsPage() {
  const t = useTranslations("admin.transactions");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const results = useQuery({
    queryKey: ["admin-tx-search", debouncedQuery],
    queryFn: () => searchTransactions(debouncedQuery),
    // Keep the current rows on screen while the next search loads.
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="relative max-w-md">
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="pl-9"
        />
      </div>

      {results.isPending ? (
        <ListSkeleton rows={5} rowClassName="h-12" />
      ) : results.isError ? (
        <ErrorState onRetry={() => results.refetch()} />
      ) : results.data.length === 0 ? (
        <EmptyState icon={ScanSearch} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.reference")}</TableHead>
                <TableHead>{t("columns.merchant")}</TableHead>
                <TableHead>{t("columns.date")}</TableHead>
                <TableHead className="text-right">{t("columns.total")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.data.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                  <TableCell className="text-sm">{tx.merchant?.name ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {formatDateTime(tx.createdAt, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyAmount money={tx.total} className="text-sm font-medium" />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={tx.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Can permission="admin.refunds.issue">
                        <ReasonDialog
                          action="refund.issued"
                          targetId={tx.reference}
                          title={t("refundTitle", { reference: tx.reference })}
                          description={t("refundBody")}
                          trigger={
                            <Button size="xs" variant="outline">
                              {t("refund")}
                            </Button>
                          }
                        />
                      </Can>
                      <Can permission="admin.disputes.resolve">
                        <ReasonDialog
                          action="transaction.flagged"
                          targetId={tx.reference}
                          title={t("flagTitle", { reference: tx.reference })}
                          description={t("flagBody")}
                          trigger={
                            <Button size="xs" variant="ghost">
                              {t("flag")}
                            </Button>
                          }
                        />
                      </Can>
                    </div>
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
