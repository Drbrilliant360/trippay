"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { listAuditLog } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminAuditLogPage() {
  const t = useTranslations("admin.auditLog");
  const locale = useLocale();

  const entries = useQuery({ queryKey: ["admin-audit"], queryFn: listAuditLog });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {entries.isPending ? (
        <ListSkeleton rows={4} rowClassName="h-12" />
      ) : entries.isError ? (
        <ErrorState onRetry={() => entries.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.when")}</TableHead>
                <TableHead>{t("columns.actor")}</TableHead>
                <TableHead>{t("columns.action")}</TableHead>
                <TableHead>{t("columns.target")}</TableHead>
                <TableHead>{t("columns.reason")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDateTime(entry.at, locale)}
                  </TableCell>
                  <TableCell className="text-sm">{entry.actor}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{entry.targetId}</TableCell>
                  <TableCell className="max-w-64 text-xs text-muted-foreground">
                    {entry.reason ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("retentionNote")}</p>
    </div>
  );
}
