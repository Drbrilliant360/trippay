"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { BadgeCheck, Building2, FileCheck2, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getBusiness } from "@/lib/api/business";
import { PageHeader } from "@/components/shared/page-header";
import { StatusChip } from "@/components/status/status-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";

const STEPS = [
  { key: "register", icon: Building2, done: true },
  { key: "verify", icon: FileCheck2, done: true },
  { key: "team", icon: Users, done: false },
] as const;

export default function OnboardingPage() {
  const t = useTranslations("bizOnboarding");
  const business = useQuery({ queryKey: ["business"], queryFn: getBusiness });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {business.isPending ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : business.isError ? (
        <ErrorState onRetry={() => business.refetch()} />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div>
              <p className="flex items-center gap-1.5 font-heading text-lg font-bold">
                {business.data.name}
                {business.data.verified && (
                  <BadgeCheck className="size-4.5 text-success" aria-hidden="true" />
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {business.data.code} · {business.data.category} · {business.data.location}
              </p>
            </div>
            <StatusChip status={business.data.verificationStatus} />
          </CardContent>
        </Card>
      )}

      <ol className="space-y-3">
        {STEPS.map(({ key, icon: Icon, done }, i) => (
          <li key={key} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                done ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="font-heading font-bold">
                {i + 1}. {t(`steps.${key}.title`)}
              </h2>
              <p className="text-sm text-muted-foreground">{t(`steps.${key}.body`)}</p>
            </div>
            <StatusChip status={done ? "completed" : "pending"} />
          </li>
        ))}
      </ol>

      <Button asChild size="lg" className="w-full">
        <Link href="/biz/dashboard">{t("goToDashboard")}</Link>
      </Button>
    </div>
  );
}
