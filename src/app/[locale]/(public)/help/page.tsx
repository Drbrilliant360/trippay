import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

const FAQ_KEYS = ["pending", "fees", "refund", "verify", "pin", "contact"] as const;

export default function HelpPage() {
  const t = useTranslations("help");

  return (
    <div className="space-y-6 pt-8">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div
        className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info-soft p-4 text-sm text-info"
        role="note"
      >
        <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="font-medium">{t("pinNotice")}</p>
      </div>

      <dl className="space-y-3">
        {FAQ_KEYS.map((key) => (
          <div key={key} className="rounded-2xl border bg-card p-5">
            <dt className="font-heading font-bold">{t(`faq.${key}.q`)}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{t(`faq.${key}.a`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
