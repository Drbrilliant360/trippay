"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { listDisputes } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/datetime";
import { maskPhone } from "@/lib/mask";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import { Button } from "@/components/ui/button";

export default function AdminDisputesPage() {
  const t = useTranslations("admin.disputes");
  const locale = useLocale();

  const disputes = useQuery({ queryKey: ["admin-disputes"], queryFn: listDisputes });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {disputes.isPending ? (
        <ListSkeleton rows={2} rowClassName="h-24" />
      ) : disputes.isError ? (
        <ErrorState onRetry={() => disputes.refetch()} />
      ) : disputes.data.length === 0 ? (
        <EmptyState icon={ShieldAlert} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="space-y-2">
          {disputes.data.map((dispute) => (
            <div key={dispute.id} className="space-y-3 rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-medium">{dispute.reference}</p>
                  <p className="text-xs text-muted-foreground">
                    {maskPhone(dispute.customer)} ·{" "}
                    {t("opened", { time: formatDateTime(dispute.openedAt, locale) })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MoneyAmount money={dispute.amount} className="font-semibold" />
                  <StatusChip status={dispute.status} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{dispute.reason}</p>
              <Can permission="admin.disputes.resolve">
                <div className="flex gap-2">
                  <ReasonDialog
                    action="dispute.refunded"
                    targetId={dispute.reference}
                    title={t("resolveRefundTitle", { reference: dispute.reference })}
                    description={t("resolveRefundBody")}
                    trigger={
                      <Button size="sm" variant="outline">
                        {t("resolveRefund")}
                      </Button>
                    }
                  />
                  <ReasonDialog
                    action="dispute.rejected"
                    targetId={dispute.reference}
                    title={t("rejectTitle", { reference: dispute.reference })}
                    description={t("rejectBody")}
                    trigger={
                      <Button size="sm" variant="ghost">
                        {t("reject")}
                      </Button>
                    }
                  />
                </div>
              </Can>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
