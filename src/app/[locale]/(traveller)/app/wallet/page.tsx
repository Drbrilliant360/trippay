"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Info, Plus, Wallet } from "lucide-react";
import { getWalletBalances } from "@/lib/api/wallet";
import { listTransactions } from "@/lib/api/transactions";
import { PageHeader } from "@/components/shared/page-header";
import { BalanceCard } from "@/components/money/balance-card";
import { TransactionRow } from "@/components/payments/transaction-row";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function WalletPage() {
  const t = useTranslations("wallet");

  const balances = useQuery({ queryKey: ["balances"], queryFn: getWalletBalances });
  const transactions = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => listTransactions(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus data-icon="inline-start" aria-hidden="true" />
                {t("addFunds")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addFunds")}</DialogTitle>
                <DialogDescription>{t("addFundsExplainer")}</DialogDescription>
              </DialogHeader>
              <div className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-sm text-info">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>{t("addFundsMockNote")}</p>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {balances.isPending ? (
        <ListSkeleton rows={2} rowClassName="h-44" />
      ) : balances.isError ? (
        <ErrorState onRetry={() => balances.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {balances.data.map((balance, i) => (
            <BalanceCard key={balance.currency} balance={balance} emphasis={i === 0} />
          ))}
        </div>
      )}

      <section aria-labelledby="wallet-activity" className="space-y-2">
        <h2 id="wallet-activity" className="font-heading font-bold">
          {t("activityTitle")}
        </h2>
        {transactions.isPending ? (
          <ListSkeleton rows={4} />
        ) : transactions.isError ? (
          <ErrorState onRetry={() => transactions.refetch()} />
        ) : transactions.data.length === 0 ? (
          <EmptyState icon={Wallet} title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <div className="space-y-2">
            {transactions.data.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
