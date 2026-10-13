import { useTranslations } from "next-intl";
import { CheckCircle2, Landmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoonBadge } from "@/components/status/coming-soon-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Travel financing is approval-gated: information only, no application. */
export default function FinancingPage() {
  const t = useTranslations("financing");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader title={t("title")} action={<ComingSoonBadge />} />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Landmark className="size-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">{t("explainer")}</p>

          <div className="rounded-xl bg-muted p-4">
            <h2 className="font-heading text-sm font-bold">{t("howTitle")}</h2>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {(["step1", "step2", "step3"] as const).map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  {t(step)}
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-xl bg-pending-soft p-3 text-xs text-pending">
            {t("eligibilityNote")}
          </p>
          <p className="text-xs text-muted-foreground">{t("gateNote")}</p>

          <Button asChild variant="outline" className="w-full">
            <Link href="/app/savings">{t("startSaving")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
