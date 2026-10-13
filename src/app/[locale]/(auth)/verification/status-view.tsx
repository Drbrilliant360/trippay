"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Check, Clock, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getVerificationStatus, type VerificationScenario } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { StatusChip } from "@/components/status/status-chip";
import { NeedsInfoBanner } from "./needs-info-banner";
import { cn } from "@/lib/utils";
import { AuthSteps } from "../auth-steps";

export function StatusView({ scenario }: { scenario: VerificationScenario }) {
  const t = useTranslations("auth.verification");
  const [docUploaded, setDocUploaded] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["verification-status", scenario],
    queryFn: () => getVerificationStatus(scenario),
  });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <AuthSteps current={3} />
      <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>

      {isPending && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      )}
      {isError && <ErrorState className="mt-8" onRetry={() => refetch()} />}

      {data && (
        <>
          {data.needsInfo && (
            <NeedsInfoBanner
              caseRef={data.needsInfo.caseRef}
              onUploaded={() => setDocUploaded(true)}
            />
          )}

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
            <Timeline
              identityNeedsInfo={data.steps.identity === "needs_info" && !docUploaded}
            />

            <div className="space-y-6">
              <section
                aria-labelledby="while-heading"
                className="rounded-2xl border bg-card p-6"
              >
                <h2 id="while-heading" className="font-heading text-lg font-bold">
                  {t("while.title")}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {(["browse", "savings", "rates"] as const).map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {t(`while.${key}`)}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-5 bg-ink text-white hover:bg-ink/85">
                  <Link href="/app">{t("while.cta")}</Link>
                </Button>
              </section>

              <section aria-labelledby="locked-heading" className="rounded-2xl bg-muted p-6">
                <h2
                  id="locked-heading"
                  className="flex items-center gap-2 font-heading text-lg font-bold"
                >
                  <Lock className="size-4" aria-hidden="true" />
                  {t("locked.title")}
                </h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  <li>{t("locked.payments")}</li>
                  <li>{t("locked.funding")}</li>
                </ul>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Timeline({ identityNeedsInfo }: { identityNeedsInfo: boolean }) {
  const t = useTranslations("auth.verification");

  return (
    <ol className="rounded-2xl border bg-card p-6">
      {/* Phone and email verified */}
      <li className="flex gap-4">
        <div className="flex flex-col items-center">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-white"
            aria-hidden="true"
          >
            <Check className="size-4" />
          </span>
          <span className="w-px flex-1 bg-success" aria-hidden="true" />
        </div>
        <div className="pb-8">
          <h2 className="font-heading font-bold">{t("steps.contact")}</h2>
          <StatusChip status="completed" className="mt-1.5" />
        </div>
      </li>

      {/* Identity check */}
      <li className="flex gap-4">
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full border-2",
              identityNeedsInfo ? "border-failed text-failed" : "border-pending text-pending",
            )}
            aria-hidden="true"
          >
            <Clock className="size-4" />
          </span>
          <span className="w-px flex-1 bg-border" aria-hidden="true" />
        </div>
        <div className="pb-8">
          <h2 className="font-heading font-bold">{t("steps.identity")}</h2>
          <StatusChip
            status={identityNeedsInfo ? "more_info" : "under_review"}
            className="mt-1.5"
          />
          <p className="mt-2 text-sm text-muted-foreground">{t("steps.identityHint")}</p>
        </div>
      </li>

      {/* Account ready */}
      <li className="flex gap-4">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-bold text-muted-foreground"
          aria-hidden="true"
        >
          3
        </span>
        <div>
          <h2 className="font-heading font-bold">{t("steps.ready")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("steps.notStarted")}</p>
        </div>
      </li>
    </ol>
  );
}
