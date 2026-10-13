"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ReconRow } from "@/lib/api/business";
import { matchRowToBooking } from "@/lib/api/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Assign a booking reference to an unmatched transaction. */
export function MatchDialog({ row }: { row: ReconRow }) {
  const t = useTranslations("bizReports.matchDialog");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState(false);

  const mutation = useMutation({
    mutationFn: matchRowToBooking,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["biz-recon"] });
      setOpen(false);
      toast.success(t("success", { reference: updated.reference, ref: updated.bookingRef ?? "" }));
    },
  });

  function submit() {
    if (!/^[A-Z]{2}-\d{4}-\d{3,4}$/i.test(bookingRef.trim())) {
      setError(true);
      return;
    }
    mutation.mutate({ id: row.id, bookingRef: bookingRef.trim().toUpperCase() });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setBookingRef("");
          setError(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="bg-ink text-white hover:bg-ink/85">
          {t("action")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("body", { reference: row.reference })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`match-ref-${row.id}`}>{t("bookingRef")}</Label>
          <Input
            id={`match-ref-${row.id}`}
            value={bookingRef}
            onChange={(e) => {
              setBookingRef(e.target.value);
              setError(false);
            }}
            placeholder="KT-2026-0405"
            aria-invalid={error}
          />
          {error && <p className="text-xs text-failed">{t("error")}</p>}
        </div>
        <Button type="button" className="w-full" onClick={submit} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("submit")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
