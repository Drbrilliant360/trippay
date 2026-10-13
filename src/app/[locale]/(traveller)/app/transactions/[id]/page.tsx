"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileQuestion, LifeBuoy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTransaction } from "@/lib/api/transactions";
import { Receipt } from "@/components/payments/receipt";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("transactions");

  const transaction = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => getTransaction(id),
  });

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      <Link
        href="/app/transactions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("back")}
      </Link>

      <h1 className="font-heading text-2xl font-bold">{t("detailTitle")}</h1>

      {transaction.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : transaction.isError ? (
        <ErrorState onRetry={() => transaction.refetch()} />
      ) : !transaction.data ? (
        <EmptyState
          icon={FileQuestion}
          title={t("notFoundTitle")}
          description={t("notFoundBody")}
        />
      ) : (
        <>
          <Receipt transaction={transaction.data} />
          <Button asChild variant="outline" className="w-full">
            <Link href="/app/support">
              <LifeBuoy data-icon="inline-start" aria-hidden="true" />
              {t("reportIssue")}
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
