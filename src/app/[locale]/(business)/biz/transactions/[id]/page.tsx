"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTransaction } from "@/lib/api/transactions";
import { Receipt } from "@/components/payments/receipt";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function BizTransactionDetailPage({
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
    <div className="mx-auto max-w-xl space-y-4">
      <Link
        href="/biz/transactions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("back")}
      </Link>

      <h1 className="font-heading text-2xl font-bold">{t("detailTitle")}</h1>

      {transaction.isPending ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : transaction.isError ? (
        <ErrorState onRetry={() => transaction.refetch()} />
      ) : !transaction.data ? (
        <EmptyState
          icon={FileQuestion}
          title={t("notFoundTitle")}
          description={t("notFoundBody")}
        />
      ) : (
        <Receipt transaction={transaction.data} />
      )}
    </div>
  );
}
