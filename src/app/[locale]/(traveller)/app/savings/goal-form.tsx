"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import type { Currency } from "@/lib/types";
import { parseAmountToMinor } from "@/lib/money";
import { createSavingsGoal } from "@/lib/api/savings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/money/currency-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(2),
  amount: z.string().min(1),
  targetDate: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function GoalForm() {
  const t = useTranslations("savings.form");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("TZS");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: createSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      reset();
      setOpen(false);
      toast.success(t("created"));
    },
  });

  function onSubmit(values: FormValues) {
    const targetMinor = parseAmountToMinor(values.amount, currency);
    if (targetMinor === null || targetMinor <= 0) {
      setError("amount", { type: "validate" });
      return;
    }
    mutation.mutate({
      name: values.name,
      targetMinor,
      currency,
      targetDate: new Date(values.targetDate).toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus data-icon="inline-start" aria-hidden="true" />
          {t("newGoal")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="goal-name">{t("name")}</Label>
            <Input
              id="goal-name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-failed">{t("errors.name")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-amount">{t("target")}</Label>
            <div className="flex gap-2">
              <CurrencySelect value={currency} onChange={setCurrency} />
              <Input
                id="goal-amount"
                inputMode="decimal"
                placeholder="4,500,000"
                aria-invalid={!!errors.amount}
                className="money"
                {...register("amount")}
              />
            </div>
            {errors.amount && <p className="text-xs text-failed">{t("errors.amount")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-date">{t("targetDate")}</Label>
            <Input
              id="goal-date"
              type="date"
              aria-invalid={!!errors.targetDate}
              {...register("targetDate")}
            />
            {errors.targetDate && (
              <p className="text-xs text-failed">{t("errors.targetDate")}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("submit")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("planningNote")}</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
