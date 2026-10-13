"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import {
  resolveReconException,
  type DailyReconException,
  type ReconExceptionType,
} from "@/lib/api/admin";
import { Can } from "@/components/auth/can";
import { Button } from "@/components/ui/button";
import { MoneyAmount } from "@/components/money/money-amount";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TYPE_CLASSES: Record<ReconExceptionType, string> = {
  missing_at_provider: "bg-failed-soft text-failed",
  amount_mismatch: "bg-pending-soft text-pending",
  status_mismatch: "bg-info-soft text-info",
  duplicate: "bg-muted text-muted-foreground",
};

/** Open exceptions for the selected provider-day, resolved via correction entries. */
export function ExceptionsTable({ exceptions }: { exceptions: DailyReconException[] }) {
  const t = useTranslations("admin.reconciliation.exceptions");
  const ts = useTranslations("status");
  const queryClient = useQueryClient();

  async function handleResolved(id: string) {
    await resolveReconException(id);
    queryClient.invalidateQueries({ queryKey: ["admin-daily-recon"] });
  }

  if (exceptions.length === 0) {
    return <EmptyState icon={CheckCircle2} title={t("emptyTitle")} description={t("emptyBody")} />;
  }

  return (
    <section aria-labelledby="exceptions-heading" className="rounded-2xl border bg-card">
      <h2 id="exceptions-heading" className="px-5 pt-5 font-heading text-lg font-bold">
        {t("title")}
      </h2>
      <div className="mt-2 overflow-x-auto">
        <Table aria-label={t("title")}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">{t("columns.reference")}</TableHead>
              <TableHead className="text-right">{t("columns.ledgerAmount")}</TableHead>
              <TableHead className="text-right">{t("columns.providerAmount")}</TableHead>
              <TableHead>{t("columns.statuses")}</TableHead>
              <TableHead>{t("columns.type")}</TableHead>
              <TableHead>{t("columns.assignee")}</TableHead>
              <TableHead className="pr-5 text-right">
                <span className="sr-only">{t("columns.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exceptions.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell className="money pl-5 font-medium">{ex.reference}</TableCell>
                <TableCell className="text-right">
                  {ex.ledgerAmount ? <MoneyAmount money={ex.ledgerAmount} /> : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    ex.type === "amount_mismatch" && "font-semibold text-failed",
                  )}
                >
                  {ex.providerAmount ? <MoneyAmount money={ex.providerAmount} /> : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  <span className={cn(ex.type === "status_mismatch" && "text-failed")}>
                    {ex.ledgerStatus ? ts(ex.ledgerStatus) : "—"}
                  </span>{" "}
                  /{" "}
                  <span
                    className={cn(
                      ex.type === "status_mismatch" && "font-semibold text-success",
                    )}
                  >
                    {ex.providerStatus ? ts(ex.providerStatus) : "—"}
                    {ex.secondLine ? ` ${t("secondLine")}` : ""}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
                      TYPE_CLASSES[ex.type],
                    )}
                  >
                    {t(`types.${ex.type}`)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {ex.assignee ?? t("unassigned")}
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <Can permission="admin.transactions.search">
                    <ReasonDialog
                      action="reconciliation.correction_entry"
                      targetId={ex.reference}
                      title={t("resolveTitle", { reference: ex.reference })}
                      description={t("resolveBody")}
                      onSuccess={() => handleResolved(ex.id)}
                      trigger={
                        <Button type="button" size="sm" variant="outline">
                          {t("resolve")}
                        </Button>
                      }
                    />
                  </Can>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
