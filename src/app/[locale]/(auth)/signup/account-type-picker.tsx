"use client";

import { useTranslations } from "next-intl";
import { Backpack, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccountType = "traveller" | "business";

const OPTIONS = [
  { type: "traveller", icon: Backpack },
  { type: "business", icon: Building2 },
] as const;

export function AccountTypePicker({
  value,
  onChange,
}: {
  value: AccountType;
  onChange: (type: AccountType) => void;
}) {
  const t = useTranslations("auth.signup");

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t("howUse")}>
      {OPTIONS.map(({ type, icon: Icon }) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(type)}
            className={cn(
              "relative rounded-2xl border bg-card p-5 text-left transition-colors",
              selected ? "border-brand ring-1 ring-brand" : "border-border hover:border-ink/40",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-4 right-4 flex size-5 items-center justify-center rounded-full border-2",
                selected ? "border-brand" : "border-border",
              )}
            >
              {selected && <span className="size-2.5 rounded-full bg-brand" />}
            </span>
            <Icon
              className={cn("size-7", selected ? "text-brand" : "text-ink")}
              aria-hidden="true"
            />
            <span className="mt-3 block font-heading text-lg font-bold">
              {t(`types.${type}.title`)}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {t(`types.${type}.body`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
