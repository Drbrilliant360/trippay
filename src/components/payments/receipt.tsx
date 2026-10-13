import { useLocale, useTranslations } from "next-intl";
import type { Transaction } from "@/lib/types";
import { formatDateTime } from "@/lib/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MoneyAmount } from "@/components/money/money-amount";
import { FeeBreakdown } from "@/components/money/fee-breakdown";
import { StatusChip } from "@/components/status/status-chip";
import { StatusTimeline } from "@/components/status/status-timeline";
import { CopyButton } from "@/components/shared/copy-button";

interface ReceiptProps {
  transaction: Transaction;
}

/** Full transaction receipt: reference with copy, breakdown and timeline. */
export function Receipt({ transaction }: ReceiptProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="items-center text-center">
          <StatusChip status={transaction.status} className="mx-auto" />
          <MoneyAmount
            money={transaction.total}
            signed={transaction.direction}
            className="mt-2 block font-heading text-3xl font-bold"
          />
          <CardTitle className="text-base font-normal text-muted-foreground">
            {transaction.merchant?.name ?? transaction.counterparty ?? t("unknownParty")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeeBreakdown
            amount={transaction.amount}
            fee={transaction.fee}
            total={transaction.total}
          />
          <Separator />
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">{t("reference")}</dt>
              <dd className="flex items-center gap-1 font-mono">
                {transaction.reference}
                <CopyButton value={transaction.reference} />
              </dd>
            </div>
            {transaction.bookingRef && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{t("bookingRef")}</dt>
                <dd className="font-mono">{transaction.bookingRef}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">{t("method")}</dt>
              <dd>{t(`methods.${transaction.method}`)}</dd>
            </div>
            {transaction.providerRef && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{t("providerRef")}</dt>
                <dd className="font-mono">{transaction.providerRef}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">{t("date")}</dt>
              <dd>{formatDateTime(transaction.createdAt, locale)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("timeline")}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline timeline={transaction.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
