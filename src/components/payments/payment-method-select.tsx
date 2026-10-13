"use client";

import { useTranslations } from "next-intl";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import type { PaymentMethodType } from "@/lib/types";
import { cn } from "@/lib/utils";

const METHODS: { value: PaymentMethodType; icon: typeof Smartphone }[] = [
  { value: "mobile_money", icon: Smartphone },
  { value: "card", icon: CreditCard },
  { value: "bank_transfer", icon: Banknote },
];

interface PaymentMethodSelectProps {
  value: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
}

/** Neutral method labels only — no real provider names or logos. */
export function PaymentMethodSelect({ value, onChange }: PaymentMethodSelectProps) {
  const t = useTranslations("pay");
  return (
    <div role="radiogroup" aria-label={t("method")} className="grid grid-cols-3 gap-2">
      {METHODS.map(({ value: method, icon: Icon }) => {
        const selected = method === value;
        return (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(method)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors",
              selected
                ? "border-ink bg-ink text-white"
                : "border-border bg-card text-muted-foreground hover:border-ink/40",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {t(`methods.${method}`)}
          </button>
        );
      })}
    </div>
  );
}
