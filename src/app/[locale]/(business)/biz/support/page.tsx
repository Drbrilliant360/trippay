"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { LifeBuoy, ShieldAlert } from "lucide-react";
import { listSupportCases } from "@/lib/api/notifications";
import { formatDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusChip } from "@/components/status/status-chip";
import { Card, CardContent } from "@/components/ui/card";

export default function BizSupportPage() {
  const t = useTranslations("bizSupport");
  const locale = useLocale();

  const cases = useQuery({ queryKey: ["support-cases"], queryFn: listSupportCases });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-info" aria-hidden="true" />
          <div>
            <h2 className="font-heading font-bold">{t("escalationTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("escalationBody")}</p>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="biz-cases" className="space-y-2">
        <h2 id="biz-cases" className="font-heading font-bold">
          {t("casesTitle")}
        </h2>
        {cases.isPending ? (
          <ListSkeleton rows={2} />
        ) : cases.isError ? (
          <ErrorState onRetry={() => cases.refetch()} />
        ) : cases.data.length === 0 ? (
          <EmptyState icon={LifeBuoy} title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <ul className="space-y-2">
            {cases.data.map((supportCase) => (
              <li
                key={supportCase.id}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{supportCase.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {supportCase.id} · {formatDateTime(supportCase.updatedAt, locale)}
                  </p>
                </div>
                <StatusChip status={supportCase.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
