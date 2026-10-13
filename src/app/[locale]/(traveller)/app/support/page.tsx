"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { LifeBuoy, Loader2, ShieldAlert } from "lucide-react";
import { createSupportCase, listSupportCases } from "@/lib/api/notifications";
import { formatDateTime } from "@/lib/datetime";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusChip } from "@/components/status/status-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  subject: z.string().min(4),
  body: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export default function SupportPage() {
  const t = useTranslations("support");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const cases = useQuery({ queryKey: ["support-cases"], queryFn: listSupportCases });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: createSupportCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-cases"] });
      reset();
    },
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div
        className="flex items-start gap-2 rounded-2xl border border-info/30 bg-info-soft p-3 text-sm text-info"
        role="note"
      >
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="font-medium">{t("pinNotice")}</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-heading font-bold">{t("newCaseTitle")}</h2>
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="mt-3 space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="subject">{t("subject")}</Label>
              <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} />
              {errors.subject && <p className="text-xs text-failed">{t("errors.subject")}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">{t("details")}</Label>
              <Textarea id="body" rows={4} aria-invalid={!!errors.body} {...register("body")} />
              {errors.body && <p className="text-xs text-failed">{t("errors.details")}</p>}
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {t("submit")}
            </Button>
            {mutation.isSuccess && (
              <p className="text-sm font-medium text-success" role="status">
                {t("created", { id: mutation.data.id })}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="cases-heading" className="space-y-2">
        <h2 id="cases-heading" className="font-heading font-bold">
          {t("casesTitle")}
        </h2>
        {cases.isPending ? (
          <ListSkeleton rows={2} />
        ) : cases.isError ? (
          <ErrorState onRetry={() => cases.refetch()} />
        ) : cases.data.length === 0 ? (
          <EmptyState icon={LifeBuoy} title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <ul className="space-y-2">
            {cases.data.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.id} · {formatDateTime(c.updatedAt, locale)}
                  </p>
                </div>
                <StatusChip status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
