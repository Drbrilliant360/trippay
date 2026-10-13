"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import type { AdminTxRow } from "@/lib/api/admin";
import { performSensitiveAction } from "@/lib/api/admin";
import { formatMoney } from "@/lib/money";
import { maskName } from "@/lib/mask";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASONS = ["timeout", "duplicate", "customerRequest", "fraud"] as const;

/** Refund with a required preset reason + optional notes; always audit-logged. */
export function RefundDialog({ row }: { row: AdminTxRow }) {
  const t = useTranslations("admin.overview.refund");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: performSensitiveAction,
    onSuccess: () => {
      toast.success(t("success", { reference: row.reference }));
      setOpen(false);
      setReason("");
      setNotes("");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setReason("");
          setNotes("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">
            {t("title", { reference: row.reference })}
          </DialogTitle>
          <DialogDescription>
            {t("line", {
              amount: formatMoney(row.amount, locale),
              user: maskName(row.userName),
              provider: row.provider,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`refund-reason-${row.id}`}>{t("reason")}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id={`refund-reason-${row.id}`} className="w-full">
                <SelectValue placeholder={t("reasonPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`reasons.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`refund-notes-${row.id}`}>{t("notes")}</Label>
            <Textarea
              id={`refund-notes-${row.id}`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
            />
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-sm text-info">
            <ScrollText className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t("auditNote")}
          </p>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={!reason || mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  action: "refund.issued",
                  targetId: row.reference,
                  reason: notes
                    ? `${t(`reasons.${reason}`)} — ${notes.trim()}`
                    : t(`reasons.${reason}`),
                })
              }
            >
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {t("confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
