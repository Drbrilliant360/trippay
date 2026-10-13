"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Bell, CircleDollarSign, LineChart, PiggyBank, ShieldAlert } from "lucide-react";
import type { AppNotification } from "@/lib/types";
import { listNotifications } from "@/lib/api/notifications";
import { formatDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<AppNotification["kind"], typeof Bell> = {
  payment: CircleDollarSign,
  security: ShieldAlert,
  savings: PiggyBank,
  rates: LineChart,
  system: Bell,
};

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const locale = useLocale();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <PageHeader title={t("title")} />

      {notifications.isPending ? (
        <ListSkeleton rows={4} />
      ) : notifications.isError ? (
        <ErrorState onRetry={() => notifications.refetch()} />
      ) : notifications.data.length === 0 ? (
        <EmptyState icon={Bell} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <ul className="space-y-2">
          {notifications.data.map((item) => {
            const Icon = KIND_ICONS[item.kind];
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border bg-card p-4",
                  !item.read && "border-brand/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    item.read ? "bg-muted text-muted-foreground" : "bg-brand/10 text-brand",
                  )}
                >
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {t(`items.${item.titleKey}` as any, item.values)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {t(`items.${item.bodyKey}` as any, item.values)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt, locale)}
                  </p>
                </div>
                {!item.read && (
                  <span
                    className="mt-1 size-2 shrink-0 rounded-full bg-brand"
                    aria-label={t("unread")}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
