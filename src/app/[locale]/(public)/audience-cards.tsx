import { useTranslations } from "next-intl";
import {
  CreditCard,
  FileText,
  HandCoins,
  QrCode,
  ScanLine,
  Store,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const TOURIST_ITEMS = [
  { key: "wallet", icon: CreditCard },
  { key: "scanPay", icon: ScanLine },
  { key: "savings", icon: Target },
  { key: "rates", icon: TrendingUp },
] as const;

const BUSINESS_ITEMS = [
  { key: "wallet", icon: Store },
  { key: "requests", icon: QrCode },
  { key: "suppliers", icon: HandCoins },
  { key: "reports", icon: FileText },
] as const;

function FeatureItem({
  icon: Icon,
  title,
  body,
  onDark = false,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  onDark?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
      <div>
        <h3 className="font-heading font-bold">{title}</h3>
        <p className={onDark ? "mt-0.5 text-sm text-white/70" : "mt-0.5 text-sm text-muted-foreground"}>
          {body}
        </p>
      </div>
    </li>
  );
}

/** The side-by-side "For tourists" / "For businesses" cards on the landing page. */
export function AudienceCards() {
  const tTourists = useTranslations("landing.tourists");
  const tBiz = useTranslations("landing.businesses");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="tourists-heading" className="rounded-2xl bg-muted p-6 sm:p-8">
        <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {tTourists("kicker")}
        </p>
        <h2 id="tourists-heading" className="mt-1 font-heading text-2xl font-extrabold uppercase">
          {tTourists("title")}
        </h2>
        <ul className="mt-5 space-y-4">
          {TOURIST_ITEMS.map(({ key, icon }) => (
            <FeatureItem
              key={key}
              icon={icon}
              title={tTourists(`${key}.title`)}
              body={tTourists(`${key}.body`)}
            />
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="businesses-heading"
        className="rounded-2xl bg-ink p-6 text-white sm:p-8"
      >
        <p className="font-heading text-xs font-semibold tracking-widest text-white/60 uppercase">
          {tBiz("kicker")}
        </p>
        <h2 id="businesses-heading" className="mt-1 font-heading text-2xl font-extrabold uppercase">
          {tBiz("title")}
        </h2>
        <ul className="mt-5 space-y-4">
          {BUSINESS_ITEMS.map(({ key, icon }) => (
            <FeatureItem
              key={key}
              icon={icon}
              title={tBiz(`${key}.title`)}
              body={tBiz(`${key}.body`)}
              onDark
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
