"use client";

import { useLocale, useTranslations } from "next-intl";
import type { WalletBalance } from "@/lib/types";
import { formatDateTime } from "@/lib/datetime";
import { isPositive } from "@/lib/money";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyAmount } from "./money-amount";

interface BalanceCardProps {
  balance: WalletBalance;
  emphasis?: boolean;
}

/**
 * Available and Pending are always shown separately; pending is never
 * presented as spendable. Shows the last-updated time.
 */
export function BalanceCard({ balance, emphasis = false }: BalanceCardProps) {
  const t = useTranslations("wallet");
  const locale = useLocale();

  return (
    <Card className={emphasis ? "border-ink bg-ink text-white" : undefined}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium opacity-70">{balance.currency}</span>
          <span className="text-xs opacity-60">
            {t("updated", { time: formatDateTime(balance.updatedAt, locale) })}
          </span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide opacity-60">
            {t("available")}
          </p>
          <MoneyAmount
            money={balance.available}
            className="font-heading text-3xl font-bold"
          />
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs opacity-60">{t("pending")}</p>
            <MoneyAmount money={balance.pending} className="font-medium" />
          </div>
          {isPositive(balance.held) && (
            <div>
              <p className="text-xs opacity-60">{t("held")}</p>
              <MoneyAmount money={balance.held} className="font-medium" />
            </div>
          )}
        </div>
        <p className="text-xs opacity-60">{t("pendingNotSpendable")}</p>
      </CardContent>
    </Card>
  );
}
