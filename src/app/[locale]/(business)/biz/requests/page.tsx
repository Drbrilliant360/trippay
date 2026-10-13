"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { getBusiness, listBizPaymentRequests } from "@/lib/api/business";
import { formatDateTime } from "@/lib/datetime";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestComposer } from "./request-composer";

export default function BizRequestsPage() {
  const t = useTranslations("bizRequests");
  const locale = useLocale();

  const business = useQuery({ queryKey: ["business"], queryFn: getBusiness });
  const requests = useQuery({
    queryKey: ["biz-requests"],
    queryFn: listBizPaymentRequests,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("form.title")} description={t("subtitle")} />

      <Can
        permission="biz.requests.create"
        fallback={<p className="text-sm text-muted-foreground">{t("noPermission")}</p>}
      >
        <RequestComposer businessName={business.data?.name ?? "…"} />
      </Can>

      <section aria-labelledby="recent-requests" className="rounded-2xl border bg-card">
        <h2 id="recent-requests" className="px-5 pt-5 font-heading text-lg font-bold">
          {t("recent.title")}
        </h2>
        <div className="mt-2 overflow-x-auto">
          {requests.isPending ? (
            <div className="p-5">
              <ListSkeleton rows={4} />
            </div>
          ) : requests.isError ? (
            <ErrorState onRetry={() => requests.refetch()} className="m-5" />
          ) : requests.data.length === 0 ? (
            <EmptyState icon={QrCode} title={t("emptyTitle")} description={t("emptyBody")} />
          ) : (
            <Table aria-label={t("recent.title")}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">{t("recent.bookingRef")}</TableHead>
                  <TableHead>{t("recent.customer")}</TableHead>
                  <TableHead>{t("recent.description")}</TableHead>
                  <TableHead className="text-right">{t("recent.amount")}</TableHead>
                  <TableHead>{t("recent.status")}</TableHead>
                  <TableHead className="pr-5">{t("recent.created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.data.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="money pl-5">{request.bookingRef}</TableCell>
                    <TableCell>{request.customerName ?? t("recent.walkIn")}</TableCell>
                    <TableCell className="max-w-64 truncate text-muted-foreground">
                      {request.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyAmount money={request.amount} className="font-semibold" />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={request.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-5 text-muted-foreground">
                      {formatDateTime(request.createdAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
