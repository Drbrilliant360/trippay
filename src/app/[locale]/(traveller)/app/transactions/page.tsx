"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ReceiptText, Search } from "lucide-react";
import type { TransactionStatus } from "@/lib/types";
import { listTransactions } from "@/lib/api/transactions";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionRow } from "@/components/payments/transaction-row";
import { TransactionTable } from "@/components/payments/transaction-table";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FILTERS = ["all", "successful", "pending", "failed"] as const;
type Filter = (typeof FILTERS)[number];

export default function TransactionsPage() {
  const t = useTranslations("transactions");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const transactions = useQuery({
    queryKey: ["transactions", filter, debouncedQuery],
    queryFn: () =>
      listTransactions({
        status: filter === "all" ? undefined : (filter as TransactionStatus),
        query: debouncedQuery || undefined,
      }),
    // Keep the current list on screen while the next search loads.
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-4">
      <PageHeader title={t("title")} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
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

        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          className="md:flex-1"
        >
          <TabsList className="w-full">
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f} className="flex-1">
                {t(`filters.${f}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {transactions.isPending ? (
        <ListSkeleton rows={5} />
      ) : transactions.isError ? (
        <ErrorState onRetry={() => transactions.refetch()} />
      ) : transactions.data.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      ) : (
        <>
          <div className="space-y-2 md:hidden">
            {transactions.data.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
          <div className="hidden md:block">
            <TransactionTable transactions={transactions.data} />
          </div>
        </>
      )}
    </div>
  );
}
