"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { listSettlements } from "@/lib/api/business";
import { formatDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { Card, CardContent } from "@/components/ui/card";

export default function BizSettlementsPage() {
  const t = useTranslations("bizSettlements");
  const locale = useLocale();

  const settlements = useQuery({
    queryKey: ["biz-settlements"],
    queryFn: listSettlements,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {settlements.isPending ? (
        <ListSkeleton rows={3} rowClassName="h-28" />
      ) : settlements.isError ? (
        <ErrorState onRetry={() => settlements.refetch()} />
      ) : settlements.data.length === 0 ? (
        <EmptyState icon={FileText} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="space-y-3">
          {settlements.data.map((settlement) => (
            <Card key={settlement.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-heading font-bold">{settlement.reference}</p>
                    <p className="text-xs text-muted-foreground">
                      {settlement.period} ·{" "}
                      {t("txCount", { count: settlement.transactionCount })}
                    </p>
                  </div>
                  <StatusChip status={settlement.status} />
                </div>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("gross")}</dt>
                    <dd>
                      <MoneyAmount money={settlement.gross} className="font-medium" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("fees")}</dt>
                    <dd>
                      <MoneyAmount money={settlement.fees} className="font-medium" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("net")}</dt>
                    <dd>
                      <MoneyAmount money={settlement.net} className="font-heading font-bold" />
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-muted-foreground">
                  {t("expected", { time: formatDateTime(settlement.expectedAt, locale) })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("definitionNote")}</p>
    </div>
  );
}
