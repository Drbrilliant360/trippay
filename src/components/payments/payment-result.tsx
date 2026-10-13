"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, Clock, XCircle } from "lucide-react";
import type { Money, Transaction } from "@/lib/types";
import { formatDateTime } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DiagonalCorner } from "@/components/brand/diagonal-shape";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { CopyButton } from "@/components/shared/copy-button";

interface PaymentResultProps {
  transaction: Transaction;
  newAvailable?: Money;
  onRetry?: () => void;
}

/**
 * Done step. A timeout/slow provider shows PENDING with "don't pay again" —
 * never "failed". Failures use the failed palette with icon + label.
 */
export function PaymentResult({ transaction, newAvailable, onRetry }: PaymentResultProps) {
  const t = useTranslations("pay");
  const locale = useLocale();
  const status = transaction.status;
  const ok = status === "successful";
  const pending = status === "pending" || status === "awaiting_authorisation";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white">
      <DiagonalCorner />
      <div className="relative z-10 space-y-5">
        <div
          className={`flex size-14 items-center justify-center rounded-full ${
            ok ? "bg-success" : pending ? "bg-pending" : "bg-failed"
          }`}
        >
          {ok ? (
            <Check className="size-7" aria-hidden="true" />
          ) : pending ? (
            <Clock className="size-7" aria-hidden="true" />
          ) : (
            <XCircle className="size-7" aria-hidden="true" />
          )}
        </div>

        <div className="space-y-2">
          <StatusChip status={status} />
          <MoneyAmount
            money={transaction.total}
            className="block font-heading text-4xl font-bold"
          />
          <p className="text-sm text-white/70">
            {ok
              ? t("paidTo", { merchant: transaction.merchant?.name ?? "" })
              : pending
                ? t("pendingNotice")
                : t("failedNotice")}
          </p>
        </div>

        <dl className="space-y-2 rounded-xl bg-white/10 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-white/60">{t("reference")}</dt>
            <dd className="flex items-center gap-1 font-mono">
              {transaction.reference}
              <CopyButton value={transaction.reference} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-white/60">{t("date")}</dt>
            <dd>{formatDateTime(transaction.createdAt, locale)}</dd>
          </div>
          {ok && newAvailable && (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/60">{t("newAvailable")}</dt>
              <dd>
                <MoneyAmount money={newAvailable} />
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          {status === "failed" && onRetry ? (
            <Button type="button" onClick={onRetry} className="flex-1">
              {t("tryAgain")}
            </Button>
          ) : (
            <Button
              asChild
              variant="secondary"
              className="flex-1 bg-white text-ink hover:bg-white/90"
            >
              <Link href={`/app/transactions/${transaction.id}`}>
                {t("viewReceipt")}
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="flex-1 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/app/wallet">{t("backToWallet")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
