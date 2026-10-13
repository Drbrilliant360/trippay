"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Landmark, Loader2, PiggyBank } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { listSavingsGoals, toggleGoalStatus } from "@/lib/api/savings";
import { formatDate } from "@/lib/datetime";
import { flags } from "@/lib/flags";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { ComingSoonBadge } from "@/components/status/coming-soon-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoalForm } from "./goal-form";

export default function SavingsPage() {
  const t = useTranslations("savings");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const goals = useQuery({ queryKey: ["savings-goals"], queryFn: listSavingsGoals });
  const toggle = useMutation({
    mutationFn: toggleGoalStatus,
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      if (goal) {
        toast.success(goal.status === "active" ? t("resumed") : t("paused"));
      }
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader title={t("title")} description={t("subtitle")} action={<GoalForm />} />

      {goals.isPending ? (
        <ListSkeleton rows={2} rowClassName="h-44" />
      ) : goals.isError ? (
        <ErrorState onRetry={() => goals.refetch()} />
      ) : goals.data.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {goals.data.map((goal) => {
            const pct = Math.min(
              100,
              Math.round((goal.saved.amountMinor / goal.target.amountMinor) * 100),
            );
            return (
              <Card key={goal.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-heading font-bold">{goal.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {t("byDate", { date: formatDate(goal.targetDate, locale) })}
                      </p>
                    </div>
                    <StatusChip status={goal.status} />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-sm">
                      <MoneyAmount money={goal.saved} className="font-semibold" />
                      <span className="text-muted-foreground">
                        {t("ofTarget")} <MoneyAmount money={goal.target} />
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="mt-2"
                      aria-label={t("progressAria", { pct })}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("pctSaved", { pct })} · {t("suggested")}{" "}
                      <MoneyAmount money={goal.suggestedMonthly} />
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggle.mutate(goal.id)}
                      disabled={toggle.isPending || goal.status === "completed"}
                    >
                      {toggle.isPending && toggle.variables === goal.id && (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      )}
                      {goal.status === "active" ? t("pause") : t("resume")}
                    </Button>
                    {pct >= 50 && !flags.travelFinancing && (
                      <Link
                        href="/app/financing"
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        {t("financingTeaser")}
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Landmark className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-bold">{t("financing.title")}</h2>
              <ComingSoonBadge />
            </div>
            <p className="text-sm text-muted-foreground">{t("financing.body")}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{t("planningDisclaimer")}</p>
    </div>
  );
}
