import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/brand/hero-banner";

const POINTS = ["requests", "reconcile", "suppliers", "settlements", "reports", "team"] as const;

export default function BusinessesPage() {
  const t = useTranslations("businesses");

  return (
    <div className="space-y-10 pt-8">
      <HeroBanner image="/images/businesses-zanzibar.jpg" imageAlt={t("heroAlt")}>
        <h1 className="max-w-xl font-heading text-4xl font-extrabold">{t("title")}</h1>
        <p className="mt-3 max-w-lg text-white/70">{t("subtitle")}</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/signup">{t("cta")}</Link>
        </Button>
      </HeroBanner>

      <ul className="grid gap-3 sm:grid-cols-2">
        {POINTS.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 rounded-2xl border bg-card p-4"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            <div>
              <h2 className="font-heading font-bold">{t(`points.${point}.title`)}</h2>
              <p className="text-sm text-muted-foreground">{t(`points.${point}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
