"use client";

import { useTranslations } from "next-intl";
import type { Currency } from "@/lib/types";
import { CURRENCIES } from "@/lib/money";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CurrencySelectProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  currencies?: Currency[];
  disabled?: boolean;
}

export function CurrencySelect({
  value,
  onChange,
  currencies = CURRENCIES,
  disabled,
}: CurrencySelectProps) {
  const t = useTranslations("common");
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as Currency)}
      disabled={disabled}
    >
      <SelectTrigger aria-label={t("currency")} className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
