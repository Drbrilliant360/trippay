"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { listVerificationQueue } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/datetime";
import { maskPhone } from "@/lib/mask";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusChip } from "@/components/status/status-chip";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminVerificationPage() {
  const t = useTranslations("admin.verification");
  const locale = useLocale();

  const queue = useQuery({
    queryKey: ["admin-verification"],
    queryFn: listVerificationQueue,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {queue.isPending ? (
        <ListSkeleton rows={3} />
      ) : queue.isError ? (
        <ErrorState onRetry={() => queue.refetch()} />
      ) : queue.data.length === 0 ? (
        <EmptyState icon={BadgeCheck} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="space-y-2">
          {queue.data.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {item.name}
                  <Badge variant="secondary">{t(`types.${item.type}`)}</Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  {maskPhone(item.phone)} ·{" "}
                  {t("submitted", { time: formatDateTime(item.submittedAt, locale) })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip status={item.status} />
                <Can permission="admin.verification.review">
                  <ReasonDialog
                    action="verification.approved"
                    targetId={item.id}
                    title={t("approveTitle", { name: item.name })}
                    description={t("approveBody")}
                    trigger={
                      <Button size="sm" variant="outline">
                        {t("approve")}
                      </Button>
                    }
                  />
                  <ReasonDialog
                    action="verification.more_info"
                    targetId={item.id}
                    title={t("moreInfoTitle", { name: item.name })}
                    description={t("moreInfoBody")}
                    trigger={
                      <Button size="sm" variant="ghost">
                        {t("requestInfo")}
                      </Button>
                    }
                  />
                </Can>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
