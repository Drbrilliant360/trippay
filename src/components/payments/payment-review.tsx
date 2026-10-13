"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, Info, Loader2 } from "lucide-react";
import type { PaymentQuote } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyAmount } from "@/components/money/money-amount";
import { FeeBreakdown } from "@/components/money/fee-breakdown";

interface PaymentReviewProps {
  quote: PaymentQuote;
  submitting: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}

/**
 * Review & confirm step: verified recipient name, amount, fee and total are
 * on screen, and nothing is submitted without the explicit confirm below.
 * The confirm button is disabled while submitting (double-submit protection
 * works with the idempotency key generated when this screen opened).
 */
export function PaymentReview({ quote, submitting, onConfirm, onEdit }: PaymentReviewProps) {
  const t = useTranslations("pay");

  return (
    <Card className="border-ink">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{t("paying")}</p>
          <p className="flex items-center gap-1.5 font-heading text-lg font-bold">
            {quote.merchant.name}
            {quote.merchant.verified && (
              <BadgeCheck className="size-4.5 text-success" aria-hidden="true" />
            )}
          </p>
          <p className="text-xs text-muted-foreground">{t("fromWallet", { currency: quote.amount.currency })}</p>
        </div>

        <FeeBreakdown
          amount={quote.amount}
          fee={quote.fee}
          total={quote.total}
          feeLabel={t("feeWithPct", { pct: quote.feePct })}
        />

        <div className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-sm text-info">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{t("irreversibleNotice")}</p>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            <span>
              {t("confirmAndPay")}{" "}
              <MoneyAmount money={quote.total} />
            </span>
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={onEdit}
            disabled={submitting}
          >
            {t("editDetails")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
