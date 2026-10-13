import { useLocale, useTranslations } from "next-intl";
import { money, formatMoney, formatAmount } from "@/lib/money";
import { DiagonalCorner } from "@/components/brand/diagonal-shape";
import { cn } from "@/lib/utils";

/** Static wallet mockup shown in the landing hero. Decorative, not interactive. */
export function HeroPhone({ className }: { className?: string }) {
  const t = useTranslations("landing.hero.phone");
  const locale = useLocale();

  const total = money(184260, "USD");
  const pending = money(12000, "USD");
  const tzs = money(1250000, "TZS");
  const eur = money(21000, "EUR");

  return (
    <div
      className={cn(
        "w-[230px] rounded-[2rem] border-[6px] border-ink bg-card p-3 text-ink shadow-2xl",
        className,
      )}
    >
      <p className="px-1 font-heading text-sm font-bold">{t("greeting")}</p>

      <div className="relative mt-2 overflow-hidden rounded-xl bg-ink p-3 text-white">
        <DiagonalCorner className="size-14" />
        <div className="relative z-10">
          <p className="text-[10px] font-medium tracking-widest text-white/60 uppercase">
            {t("totalAvailable")}
          </p>
          <p className="money mt-0.5 font-heading text-xl font-extrabold">
            {formatMoney(total, locale)}
          </p>
          <p className="money mt-0.5 text-[10px] text-white/60">
            {t("pending")} {formatMoney(pending, locale)}
          </p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {[tzs, eur].map((m) => (
          <div key={m.currency} className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">{m.currency}</p>
            <p className="money text-xs font-semibold">{formatAmount(m, locale)}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-full bg-brand py-2 text-center text-xs font-semibold text-white">
        {t("pay")}
      </div>
    </div>
  );
}
