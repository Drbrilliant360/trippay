import { useTranslations } from "next-intl";
import type { Money } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { MoneyAmount } from "./money-amount";

interface FeeBreakdownProps {
  amount: Money;
  fee: Money;
  total: Money;
  feeLabel?: string;
}

/** Amount, fee and total as quoted by the API — never computed in the UI. */
export function FeeBreakdown({ amount, fee, total, feeLabel }: FeeBreakdownProps) {
  const t = useTranslations("pay");
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{t("amount")}</span>
        <MoneyAmount money={amount} className="font-medium" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{feeLabel ?? t("fee")}</span>
        <MoneyAmount money={fee} className="font-medium" />
      </div>
      <Separator />
      <div className="flex items-center justify-between pt-1">
        <span className="font-medium">{t("total")}</span>
        <MoneyAmount
          money={total}
          className="font-heading text-xl font-bold"
        />
      </div>
    </div>
  );
}
