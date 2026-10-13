"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { listProviders } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { StatusChip } from "@/components/status/status-chip";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminProvidersPage() {
  const t = useTranslations("admin.providers");
  const locale = useLocale();

  const providers = useQuery({ queryKey: ["admin-providers"], queryFn: listProviders });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {providers.isPending ? (
        <ListSkeleton rows={3} rowClassName="h-28" />
      ) : providers.isError ? (
        <ErrorState onRetry={() => providers.refetch()} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {providers.data.map((provider) => (
            <Card key={provider.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-heading font-bold">{provider.name}</h2>
                  <StatusChip status={provider.status} />
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t("successRate")}</dt>
                    <dd className="money font-medium">
                      {provider.successRatePct.toFixed(1)}%
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t("pendingWebhooks")}</dt>
                    <dd className="money font-medium">{provider.pendingWebhooks}</dd>
                  </div>
                  {provider.lastIncidentAt && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("lastIncident")}</dt>
                      <dd className="text-xs">
                        {formatDateTime(provider.lastIncidentAt, locale)}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("neutralNote")}</p>
    </div>
  );
}
