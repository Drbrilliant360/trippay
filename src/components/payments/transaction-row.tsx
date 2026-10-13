import { useLocale, useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatShortDate } from "@/lib/datetime";
import { Link } from "@/i18n/navigation";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: Transaction;
  /** Base path for the detail page (traveller app by default). */
  hrefBase?: string;
}

export function TransactionRow({
  transaction,
  hrefBase = "/app/transactions",
}: TransactionRowProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();
  const incoming = transaction.direction === "in";

  return (
    <Link
      href={`${hrefBase}/${transaction.id}`}
      className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:border-ink/30"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          incoming ? "bg-success-soft text-success" : "bg-muted text-foreground",
        )}
      >
        {incoming ? (
          <ArrowDownLeft className="size-4.5" aria-hidden="true" />
        ) : (
          <ArrowUpRight className="size-4.5" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {transaction.merchant?.name ?? transaction.counterparty ?? t("unknownParty")}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatShortDate(transaction.createdAt, locale)} · {transaction.reference}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <MoneyAmount
          money={transaction.total}
          signed={transaction.direction}
          className={cn("text-sm font-semibold", incoming && "text-success")}
        />
        <StatusChip status={transaction.status} />
      </div>
    </Link>
  );
}
