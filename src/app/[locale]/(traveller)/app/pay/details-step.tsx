"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, SearchX } from "lucide-react";
import type { Currency, MerchantSummary, PaymentMethodType } from "@/lib/types";
import { CURRENCY_DECIMALS, formatMoney, parseAmountToMinor } from "@/lib/money";
import { lookupRecipient } from "@/lib/api/payments";
import { getWalletBalances } from "@/lib/api/wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/money/currency-select";
import { MerchantCard } from "@/components/payments/merchant-card";
import { PaymentMethodSelect } from "@/components/payments/payment-method-select";

export interface PaymentDetails {
  merchant: MerchantSummary;
  amountMinor: number;
  currency: Currency;
  method: PaymentMethodType;
}

interface DetailsStepProps {
  initialCode?: string;
  initialDetails?: PaymentDetails | null;
  onContinue: (details: PaymentDetails) => void;
}

/** Renders integer minor units back into the amount field, e.g. 4550 USD -> "45.50". */
function minorToInput(amountMinor: number, currency: Currency): string {
  const decimals = CURRENCY_DECIMALS[currency];
  if (decimals === 0) return String(amountMinor);
  const padded = String(amountMinor).padStart(decimals + 1, "0");
  return `${padded.slice(0, -decimals)}.${padded.slice(-decimals)}`;
}

/** Step 1 — who are you paying, how much, and by which method. */
export function DetailsStep({ initialCode, initialDetails, onContinue }: DetailsStepProps) {
  const t = useTranslations("pay");
  const locale = useLocale();

  // The step unmounts between steps, so "Edit details" restores the full
  // previous entry (recipient, amount, currency, method) via initial state.
  // Lookup also matches the merchant's exact name, so it re-resolves.
  const initialLookup = initialDetails?.merchant.name ?? initialCode ?? "";
  const [code, setCode] = useState(initialLookup);
  const [searchCode, setSearchCode] = useState(initialLookup);
  const [amountInput, setAmountInput] = useState(
    initialDetails
      ? minorToInput(initialDetails.amountMinor, initialDetails.currency)
      : "",
  );
  const [currency, setCurrency] = useState<Currency>(initialDetails?.currency ?? "TZS");
  const [method, setMethod] = useState<PaymentMethodType>(
    initialDetails?.method ?? "mobile_money",
  );

  const lookup = useQuery({
    queryKey: ["recipient", searchCode],
    queryFn: () => lookupRecipient(searchCode),
    enabled: searchCode.length >= 3,
  });

  const balances = useQuery({ queryKey: ["balances"], queryFn: getWalletBalances });
  const balance = balances.data?.find((b) => b.currency === currency);

  const merchant = lookup.data ?? null;
  const amountMinor = parseAmountToMinor(amountInput, currency);
  const canContinue = !!merchant && amountMinor !== null && amountMinor > 0;

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand font-heading text-sm font-bold text-white">
            1
          </span>
          <h2 className="font-heading text-lg font-bold">{t("whoTitle")}</h2>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recipient">{t("recipientLabel")}</Label>
          <Input
            id="recipient"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={() => setSearchCode(code.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setSearchCode(code.trim());
              }
            }}
            placeholder="TP-BIZ-20418"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">{t("recipientHint")}</p>
        </div>

        {lookup.isFetching && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("lookingUp")}
          </p>
        )}
        {lookup.isFetched && !lookup.isFetching && !merchant && (
          <p className="flex items-center gap-2 text-sm font-medium text-failed" role="alert">
            <SearchX className="size-4" aria-hidden="true" />
            {t("notFound")}
          </p>
        )}
        {merchant && <MerchantCard merchant={merchant} />}

        <div className="space-y-1.5">
          <Label htmlFor="amount">{t("amount")}</Label>
          <div className="flex gap-2">
            <CurrencySelect
              value={currency}
              onChange={setCurrency}
              currencies={["TZS", "USD"]}
            />
            <Input
              id="amount"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder={currency === "TZS" ? "450,000" : "100.00"}
              aria-invalid={amountInput !== "" && amountMinor === null}
              className="money"
            />
          </div>
          {amountInput !== "" && amountMinor === null && (
            <p className="text-xs text-failed">{t("invalidAmount")}</p>
          )}
          {balance && (
            <p className="text-xs text-muted-foreground">
              {t("availableNote", {
                available: formatMoney(balance.available, locale),
                pending: formatMoney(balance.pending, locale),
              })}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t("method")}</Label>
          <PaymentMethodSelect value={method} onChange={setMethod} />
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canContinue}
          onClick={() => {
            if (merchant && amountMinor !== null) {
              onContinue({ merchant, amountMinor, currency, method });
            }
          }}
        >
          {t("continue")}
        </Button>
      </CardContent>
    </Card>
  );
}
