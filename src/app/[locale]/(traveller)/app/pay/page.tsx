"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { Transaction } from "@/lib/types";
import { getPaymentQuote, submitPayment } from "@/lib/api/payments";
import { getWalletBalances } from "@/lib/api/wallet";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentReview } from "@/components/payments/payment-review";
import { PaymentResult } from "@/components/payments/payment-result";
import { ErrorState } from "@/components/shared/error-state";
import { StepIndicator } from "@/components/shared/step-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailsStep, type PaymentDetails } from "./details-step";

type Step = "details" | "review" | "done";

function PayFlow() {
  const t = useTranslations("pay");
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  // Generated when the review screen opens; sent with the submit call so a
  // repeated tap can never charge twice.
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [result, setResult] = useState<Transaction | null>(null);

  const quote = useQuery({
    queryKey: ["quote", details?.merchant.id, details?.amountMinor, details?.currency],
    queryFn: () =>
      getPaymentQuote({
        merchantId: details!.merchant.id,
        amountMinor: details!.amountMinor,
        currency: details!.currency,
      }),
    enabled: step === "review" && !!details,
  });

  const balances = useQuery({
    queryKey: ["balances"],
    queryFn: getWalletBalances,
    enabled: step === "done",
  });

  const submit = useMutation({
    mutationFn: submitPayment,
    onSuccess: (tx) => {
      setResult(tx);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  function goToReview(nextDetails: PaymentDetails) {
    setDetails(nextDetails);
    setIdempotencyKey(crypto.randomUUID());
    setStep("review");
  }

  function confirm() {
    if (!details || !idempotencyKey) return;
    submit.mutate({
      idempotencyKey,
      merchantId: details.merchant.id,
      amountMinor: details.amountMinor,
      currency: details.currency,
      method: details.method,
    });
  }

  const newAvailable = balances.data?.find(
    (b) => b.currency === result?.total.currency,
  )?.available;

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <PageHeader
        title={t("title")}
        description={step === "done" ? undefined : t("subtitle")}
      />

      <PayStepIndicator current={step} />

      {step === "details" && (
        <DetailsStep
          initialCode={searchParams.get("code") ?? undefined}
          initialDetails={details}
          onContinue={goToReview}
        />
      )}

      {step === "review" &&
        (quote.isPending ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : quote.isError ? (
          <ErrorState onRetry={() => quote.refetch()} />
        ) : (
          <PaymentReview
            quote={quote.data}
            submitting={submit.isPending}
            onConfirm={confirm}
            onEdit={() => setStep("details")}
          />
        ))}

      {step === "done" && result && (
        <PaymentResult
          transaction={result}
          newAvailable={newAvailable}
          onRetry={() => {
            // Failed payment: new attempt = new idempotency key
            setIdempotencyKey(crypto.randomUUID());
            setResult(null);
            setStep("review");
          }}
        />
      )}
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <PayFlow />
    </Suspense>
  );
}

const STEP_ORDER: Step[] = ["details", "review", "done"];

function PayStepIndicator({ current }: { current: Step }) {
  const t = useTranslations("pay.steps");
  const idx = STEP_ORDER.indexOf(current);

  return (
    <StepIndicator
      steps={STEP_ORDER.map((step) => t(step))}
      current={idx}
      ariaLabel={t("aria", { current: idx + 1, total: STEP_ORDER.length })}
    />
  );
}
