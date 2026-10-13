"use client";

import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { performSensitiveAction } from "@/lib/api/admin";
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

interface ReasonDialogProps {
  /** Machine action name recorded in the audit log, e.g. "refund.issued". */
  action: string;
  targetId: string;
  title: string;
  description: string;
  trigger: ReactNode;
  /** Called after the action is confirmed and audit-logged. */
  onSuccess?: () => void;
}

/**
 * Every sensitive admin action requires a reason and is audit-logged —
 * the dialog says so explicitly before the admin confirms.
 */
export function ReasonDialog({
  action,
  targetId,
  title,
  description,
  trigger,
  onSuccess,
}: ReasonDialogProps) {
  const t = useTranslations("admin.reasonDialog");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: performSensitiveAction,
    onSuccess: () => {
      toast.success(t("logged"));
      setOpen(false);
      setReason("");
      onSuccess?.();
    },
  });

  const valid = reason.trim().length >= 10;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setReason("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`reason-${action}-${targetId}`}>{t("reasonLabel")}</Label>
            <Textarea
              id={`reason-${action}-${targetId}`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
            />
            {!valid && reason.length > 0 && (
              <p className="text-xs text-failed">{t("reasonTooShort")}</p>
            )}
          </div>
          <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            <ScrollText className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t("auditNotice")}
          </p>
          <Button
            type="button"
            className="w-full"
            disabled={!valid || mutation.isPending}
            onClick={() => mutation.mutate({ action, targetId, reason: reason.trim() })}
          >
            {mutation.isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
