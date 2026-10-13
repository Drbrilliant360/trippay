"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowDownLeft, ArrowUp, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatDateTime } from "@/lib/datetime";
import { Link, useRouter } from "@/i18n/navigation";
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

interface TransactionTableProps {
  transactions: Transaction[];
  /** Base path for the detail page (traveller app by default). */
  hrefBase?: string;
}

/**
 * Desktop table view of transactions. Rows are clickable; the party name is a
 * real link for keyboard and screen-reader users. Sorting is by date only —
 * amounts span multiple currencies, so ordering them would mislead.
 */
export function TransactionTable({
  transactions,
  hrefBase = "/app/transactions",
}: TransactionTableProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();
  const router = useRouter();
  const [newestFirst, setNewestFirst] = useState(true);

  const sorted = useMemo(() => {
    const byDate = [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return newestFirst ? byDate : byDate.reverse();
  }, [transactions, newestFirst]);

  const SortIcon = newestFirst ? ArrowDown : ArrowUp;

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table aria-label={t("title")}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t("table.party")}</TableHead>
            <TableHead aria-sort={newestFirst ? "descending" : "ascending"}>
              <button
                type="button"
                onClick={() => setNewestFirst((v) => !v)}
                className="flex items-center gap-1 rounded font-medium hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {t("table.date")}
                <SortIcon className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{t("table.sortByDate")}</span>
              </button>
            </TableHead>
            <TableHead>{t("table.reference")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="text-right">{t("table.amount")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((tx) => {
            const incoming = tx.direction === "in";
            return (
              <TableRow
                key={tx.id}
                onClick={() => router.push(`${hrefBase}/${tx.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        incoming ? "bg-success-soft text-success" : "bg-muted text-foreground",
                      )}
                    >
                      {incoming ? (
                        <ArrowDownLeft className="size-4" aria-hidden="true" />
                      ) : (
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <Link
                      href={`${hrefBase}/${tx.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="max-w-56 truncate font-medium hover:underline"
                    >
                      {tx.merchant?.name ?? tx.counterparty ?? t("unknownParty")}
                    </Link>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(tx.createdAt, locale)}
                </TableCell>
                <TableCell className="money text-muted-foreground">{tx.reference}</TableCell>
                <TableCell>
                  <StatusChip status={tx.status} />
                </TableCell>
                <TableCell className="text-right">
                  <MoneyAmount
                    money={tx.total}
                    signed={tx.direction}
                    className={cn("font-semibold", incoming && "text-success")}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
