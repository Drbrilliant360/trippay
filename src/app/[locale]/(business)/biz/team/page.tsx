"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Users } from "lucide-react";
import { listStaff } from "@/lib/api/business";
import { formatDateTime } from "@/lib/datetime";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusChip } from "@/components/status/status-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BizTeamPage() {
  const t = useTranslations("bizTeam");
  const locale = useLocale();

  const staff = useQuery({ queryKey: ["biz-staff"], queryFn: listStaff });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        action={
          <Can permission="biz.team.manage">
            <Button size="sm">
              <UserPlus data-icon="inline-start" aria-hidden="true" />
              {t("invite")}
            </Button>
          </Can>
        }
      />

      {staff.isPending ? (
        <ListSkeleton rows={3} />
      ) : staff.isError ? (
        <ErrorState onRetry={() => staff.refetch()} />
      ) : staff.data.length === 0 ? (
        <EmptyState icon={Users} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="space-y-2">
          {staff.data.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {member.email}
                  {member.lastActiveAt
                    ? ` · ${t("lastActive", {
                        time: formatDateTime(member.lastActiveAt, locale),
                      })}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t(`roles.${member.role}`)}</Badge>
                <StatusChip status={member.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("rolesNote")}</p>
    </div>
  );
}
