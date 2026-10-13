"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Payout } from "@/lib/types";
import { approvePayout, rejectPayout } from "@/lib/api/business";
import { formatDateTime } from "@/lib/datetime";
import { Can } from "@/components/auth/can";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyAmount } from "@/components/money/money-amount";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

/** Pending payouts awaiting authorisation, with approve / reject-with-reason. */
export function ApprovalQueue({ payouts }: { payouts: Payout[] }) {
  const t = useTranslations("bizSuppliers.queue");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["biz-payouts"] });

  const approve = useMutation({
    mutationFn: approvePayout,
    onSuccess: (payout) => {
      invalidate();
      toast.success(t("approvedToast", { name: payout.supplier.name }));
    },
  });

  const reject = useMutation({
    mutationFn: rejectPayout,
    onSuccess: (payout) => {
      invalidate();
      setRejectingId(null);
      setReason("");
      toast.success(t("rejectedToast", { name: payout.supplier.name }));
    },
  });

  const pending = payouts.filter((p) => p.status === "awaiting_authorisation");

  if (pending.length === 0) {
    return <EmptyState icon={CheckCircle2} title={t("emptyTitle")} description={t("emptyBody")} />;
  }

  function confirmReject(id: string) {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    reject.mutate({ id, reason: reason.trim() });
  }

  return (
    <div className="space-y-4">
      {pending.map((payout) => {
        const rejecting = rejectingId === payout.id;
        return (
          <div
            key={payout.id}
            className={cn(
              "rounded-2xl border bg-card p-5",
              rejecting && "border-failed/60",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-heading font-bold">
                  {payout.supplier.name} ·{" "}
                  <MoneyAmount money={payout.amount} className="font-heading font-bold" />
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t("meta", {
                    name: payout.requestedBy ?? "—",
                    date: formatDateTime(payout.createdAt, locale),
                    ref: payout.ref ?? "—",
                  })}
                </p>
                {payout.needsSecondApproval && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-pending-soft px-2.5 py-1 text-xs font-medium text-pending">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {t("needsSecond")}
                  </p>
                )}
              </div>
              {!rejecting && (
                <Can permission="biz.payouts.approve">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => approve.mutate(payout.id)}
                      disabled={approve.isPending || reject.isPending}
                    >
                      {approve.isPending && approve.variables === payout.id && (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      )}
                      {t("approve")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRejectingId(payout.id);
                        setReason("");
                        setReasonError(false);
                      }}
                      disabled={approve.isPending || reject.isPending}
                    >
                      {t("reject")}
                    </Button>
                  </div>
                </Can>
              )}
            </div>

            {rejecting && (
              <div className="mt-4 space-y-2">
                <Label htmlFor={`reject-reason-${payout.id}`}>
                  {t("reasonLabel")}{" "}
                  <span className="font-semibold text-failed">{t("reasonRequired")}</span>
                </Label>
                <Textarea
                  id={`reject-reason-${payout.id}`}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setReasonError(false);
                  }}
                  aria-invalid={reasonError}
                  rows={3}
                />
                {reasonError && (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-failed" role="alert">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                    {t("reasonError")}
                  </p>
                )}
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setRejectingId(null)}
                    disabled={reject.isPending}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="bg-failed text-white hover:bg-failed/85"
                    onClick={() => confirmReject(payout.id)}
                    disabled={reject.isPending}
                  >
                    {reject.isPending && (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    )}
                    {t("confirmReject")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
