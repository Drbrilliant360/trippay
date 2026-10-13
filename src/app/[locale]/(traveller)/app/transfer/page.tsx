import { useTranslations } from "next-intl";
import { ArrowLeftRight, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoonBadge } from "@/components/status/coming-soon-badge";
import { Card, CardContent } from "@/components/ui/card";

/** P2P transfers are approval-gated: explained, never functional. */
export default function TransferPage() {
  const t = useTranslations("transfer");

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <PageHeader title={t("title")} action={<ComingSoonBadge />} />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <ArrowLeftRight className="size-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">{t("explainer")}</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {t("point1")}
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {t("point2")}
            </li>
          </ul>
          <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            {t("gateNote")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
