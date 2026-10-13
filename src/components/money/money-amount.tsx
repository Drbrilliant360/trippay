import { useLocale } from "next-intl";
import type { Money } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

interface MoneyAmountProps {
  money: Money;
  /** Prefixes "+"/"−" for incoming/outgoing rows. */
  signed?: "in" | "out";
  className?: string;
}

/** The only way money is rendered: lib/money formatting + tabular figures. */
export function MoneyAmount({ money: value, signed, className }: MoneyAmountProps) {
  const locale = useLocale();
  const sign = signed === "in" ? "+" : signed === "out" ? "−" : "";
  return (
    <span className={cn("money", className)}>
      {sign}
      {formatMoney(value, locale)}
    </span>
  );
}
