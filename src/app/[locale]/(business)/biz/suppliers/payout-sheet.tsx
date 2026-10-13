"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AlertTriangle, BadgeCheck, Info, Loader2 } from "lucide-react";
import type { Currency, Supplier } from "@/lib/types";
import { parseAmountToMinor } from "@/lib/money";
import { getPayoutQuote, submitPayout } from "@/lib/api/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { CurrencySelect } from "@/components/money/currency-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PayoutSheetProps {
  suppliers: Supplier[];
  supplierId: string | null;
  onSupplierChange: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** "Pay supplier" side panel: quote from the API, explicit submit, dual approval. */
export function PayoutSheet({
  suppliers,
  supplierId,
  onSupplierChange,
  open,
  onOpenChange,
}: PayoutSheetProps) {
  const t = useTranslations("bizSuppliers.payout");
  const tm = useTranslations("bizSuppliers.methods");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const [amountInput, setAmountInput] = useState("");
  const [currency, setCurrency] = useState<Currency>("TZS");
  const [reference, setReference] = useState("");
  // Regenerated each time the panel opens — one key per payout attempt.
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const supplier = suppliers.find((s) => s.id === supplierId) ?? null;
  const amountMinor = parseAmountToMinor(amountInput, currency);
  const validAmount = amountMinor !== null && amountMinor > 0;

  const quote = useQuery({
    queryKey: ["payout-quote", supplierId, amountMinor, currency],
    queryFn: () =>
      getPayoutQuote({ supplierId: supplierId!, amountMinor: amountMinor!, currency }),
    enabled: open && !!supplierId && validAmount,
  });

  const submit = useMutation({
    mutationFn: submitPayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["biz-payouts"] }),
  });
  useEffect(() => {
    if (open) {
      setIdempotencyKey(crypto.randomUUID());
    } else {
      setAmountInput("");
      setReference("");
      submit.reset();
    }
    // Run only on open/close transitions; submit.reset identity may change per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">{t("title")}</SheetTitle>
          <SheetDescription className="sr-only">{t("title")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          {submit.isSuccess ? (
            <div className="space-y-3">
              <StatusChip status={submit.data.status} />
              <p className="text-sm text-muted-foreground">
                {submit.data.needsSecondApproval ? t("sentForApproval") : t("sentToQueue")}
              </p>
              <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
                {t("done")}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="payout-supplier">{t("supplier")}</Label>
                <Select value={supplierId ?? undefined} onValueChange={onSupplierChange}>
                  <SelectTrigger id="payout-supplier" className="w-full">
                    <SelectValue placeholder={t("supplierPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id} disabled={!s.verified}>
                        {s.name} · {s.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {supplier && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    {t("verifiedLine", {
                      method: tm(supplier.payoutMethod.type),
                      last3: supplier.payoutMethod.last3,
                    })}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payout-amount">{t("amount")}</Label>
                <div className="flex gap-2">
                  <CurrencySelect value={currency} onChange={setCurrency} />
                  <Input
                    id="payout-amount"
                    inputMode="decimal"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="850,000"
                    aria-invalid={amountInput !== "" && !validAmount}
                    className="money flex-1"
                  />
                </div>
                {amountInput !== "" && !validAmount && (
                  <p className="text-xs text-failed">{t("invalidAmount")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payout-reference">{t("reference")}</Label>
                <Input
                  id="payout-reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={t("referencePlaceholder")}
                />
              </div>

              {quote.isFetching && validAmount && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t("quoting")}
                </p>
              )}

              {quote.isError && !quote.isFetching && validAmount && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-failed-soft p-3 text-sm text-failed"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{t("quoteFailed")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => quote.refetch()}
                  >
                    {tc("retry")}
                  </Button>
                </div>
              )}

              {quote.data && validAmount && (
                <div className="space-y-2 rounded-2xl bg-muted p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("amountLabel")}</span>
                    <MoneyAmount
                      money={{ amountMinor: amountMinor!, currency }}
                      className="font-medium"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("feeLabel")}</span>
                    <MoneyAmount
                      money={{ amountMinor: quote.data.fee, currency }}
                      className="font-medium"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium">{t("totalFromWallet")}</span>
                    <MoneyAmount
                      money={{ amountMinor: quote.data.total, currency }}
                      className="font-heading text-lg font-bold"
                    />
                  </div>
                </div>
              )}

              <p className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-sm text-info">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {t("thresholdNote")}
              </p>

              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={!supplier || !validAmount || !quote.data || submit.isPending}
                onClick={() =>
                  submit.mutate({
                    idempotencyKey,
                    supplierId: supplier!.id,
                    amountMinor: amountMinor!,
                    currency,
                    reference: reference || undefined,
                  })
                }
              >
                {submit.isPending && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {quote.data?.needsSecondApproval ? t("submitApproval") : t("confirm")}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
