"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Bell, BellOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Currency } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencySelect } from "@/components/money/currency-select";

export default function SetupPage() {
  const t = useTranslations("auth.setup");
  const [currency, setCurrency] = useState<Currency>("TZS");
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [notifyRates, setNotifyRates] = useState(false);

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-1.5">
        <Label>{t("displayCurrency")}</Label>
        <CurrencySelect value={currency} onChange={setCurrency} />
        <p className="text-xs text-muted-foreground">{t("currencyHint")}</p>
      </div>

      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="notify-payments" className="font-normal">
              {t("notifyPayments")}
            </Label>
          </div>
          <Switch
            id="notify-payments"
            checked={notifyPayments}
            onCheckedChange={setNotifyPayments}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellOff className="size-4 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="notify-rates" className="font-normal">
              {t("notifyRates")}
            </Label>
          </div>
          <Switch id="notify-rates" checked={notifyRates} onCheckedChange={setNotifyRates} />
        </div>
        <p className="text-xs text-muted-foreground">{t("essentialNote")}</p>
      </div>

      <Button asChild size="lg" className="w-full">
        <Link href="/app">
          {t("finish")}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
