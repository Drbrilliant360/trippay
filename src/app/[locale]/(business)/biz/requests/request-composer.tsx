"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Currency, Money, PaymentRequest } from "@/lib/types";
import { formatMoney, parseAmountToMinor } from "@/lib/money";
import { createPaymentRequest, getRequestFeeQuote } from "@/lib/api/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/money/currency-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RequestPreview } from "./request-preview";

const EXPIRY_HOURS = [1, 6, 24, 72] as const;

const schema = z.object({
  bookingRef: z.string().min(3),
  customerName: z.string().min(2),
  customerContact: z.string().optional(),
  amount: z.string().min(1),
  expiresInHours: z.enum(["1", "6", "24", "72"]),
  description: z.string().min(4),
  feePayer: z.enum(["customer", "business"]),
});

type FormValues = z.infer<typeof schema>;

export function RequestComposer({ businessName }: { businessName: string }) {
  const t = useTranslations("bizRequests.form");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [created, setCreated] = useState<PaymentRequest | null>(null);
  // Customer total (amount + fee) as quoted when the request was created.
  const [createdTotal, setCreatedTotal] = useState<Money | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { expiresInHours: "24", feePayer: "customer" },
  });

  const values = watch();
  const amountMinor = parseAmountToMinor(values.amount ?? "", currency);
  const validAmount = amountMinor !== null && amountMinor > 0;

  // Fee always comes from the API quote, never computed here.
  const quote = useQuery({
    queryKey: ["request-fee-quote", amountMinor, currency, values.feePayer],
    queryFn: () =>
      getRequestFeeQuote({
        amountMinor: amountMinor!,
        currency,
        feePayer: values.feePayer,
      }),
    enabled: validAmount,
  });

  const mutation = useMutation({
    mutationFn: createPaymentRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ["biz-requests"] });
      setCreated(request);
      setCreatedTotal(quote.data?.customerTotal ?? request.amount);
      toast.success(t("createdToast", { ref: request.bookingRef }));
      reset({ expiresInHours: "24", feePayer: "customer" });
    },
  });

  function onSubmit(formValues: FormValues) {
    if (!validAmount) {
      setError("amount", { type: "validate" });
      return;
    }
    mutation.mutate({
      bookingRef: formValues.bookingRef,
      customerName: formValues.customerName,
      customerContact: formValues.customerContact || undefined,
      feePayer: formValues.feePayer,
      amountMinor: amountMinor!,
      currency,
      description: formValues.description,
      expiresInHours: Number(formValues.expiresInHours),
    });
  }

  const feeLine =
    validAmount && quote.data
      ? values.feePayer === "customer"
        ? t("feeLineCustomer", {
            amount: formatMoney({ amountMinor: amountMinor!, currency }, locale),
            fee: formatMoney(quote.data.fee, locale),
            total: formatMoney(quote.data.customerTotal, locale),
          })
        : t("feeLineBusiness", {
            amount: formatMoney({ amountMinor: amountMinor!, currency }, locale),
            fee: formatMoney(quote.data.fee, locale),
            net: formatMoney(quote.data.netToBusiness, locale),
          })
      : null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="req-booking">{t("bookingRef")}</Label>
            <Input
              id="req-booking"
              placeholder="KT-2026-0418"
              aria-invalid={!!errors.bookingRef}
              {...register("bookingRef")}
            />
            {errors.bookingRef && (
              <p className="text-xs text-failed">{t("errors.bookingRef")}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-customer">{t("customerName")}</Label>
            <Input
              id="req-customer"
              placeholder="Sophie Laurent"
              aria-invalid={!!errors.customerName}
              {...register("customerName")}
            />
            {errors.customerName && (
              <p className="text-xs text-failed">{t("errors.customerName")}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="req-contact">
            {t("customerContact")}{" "}
            <span className="font-normal text-muted-foreground">{t("optional")}</span>
          </Label>
          <Input id="req-contact" placeholder="sophie.l@example.com" {...register("customerContact")} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="req-amount">{t("amount")}</Label>
            <div className="flex gap-2">
              <CurrencySelect value={currency} onChange={setCurrency} />
              <Input
                id="req-amount"
                inputMode="decimal"
                placeholder="1,450.00"
                aria-invalid={!!errors.amount}
                className="money flex-1"
                {...register("amount")}
              />
            </div>
            {errors.amount && <p className="text-xs text-failed">{t("errors.amount")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-expiry">{t("expiry")}</Label>
            <Select
              value={values.expiresInHours}
              onValueChange={(v) => setValue("expiresInHours", v as FormValues["expiresInHours"])}
            >
              <SelectTrigger id="req-expiry" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_HOURS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {t(`expiryOptions.h${h}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="req-description">{t("description")}</Label>
          <Input
            id="req-description"
            placeholder={t("descriptionPlaceholder")}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-failed">{t("errors.description")}</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm leading-none font-medium">{t("feePayer")}</p>
          <div
            className="inline-flex rounded-full bg-muted p-1"
            role="radiogroup"
            aria-label={t("feePayer")}
          >
            {(["customer", "business"] as const).map((payer) => (
              <button
                key={payer}
                type="button"
                role="radio"
                aria-checked={values.feePayer === payer}
                onClick={() => setValue("feePayer", payer)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  values.feePayer === payer
                    ? "bg-ink text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`feePayers.${payer}`)}
              </button>
            ))}
          </div>
          {quote.isFetching && validAmount ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("quoting")}
            </p>
          ) : feeLine ? (
            <p className="money text-sm text-muted-foreground">{feeLine}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("submit")}
        </Button>
      </form>

      <RequestPreview
        businessName={businessName}
        created={created}
        draft={{
          bookingRef: created?.bookingRef ?? values.bookingRef ?? "",
          description: created?.description ?? values.description ?? "",
          expiryLabel: t(`expiryOptions.h${values.expiresInHours}`),
          customerContact: created?.customerContact ?? values.customerContact,
          customerTotal: created
            ? (createdTotal ?? created.amount)
            : validAmount && quote.data
              ? quote.data.customerTotal
              : null,
        }}
      />
    </div>
  );
}
