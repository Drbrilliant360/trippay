import { useTranslations } from "next-intl";
import { Check, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Thin black utility bar above the split onboarding screen. */
export function UtilityBar() {
  const t = useTranslations("auth.language");
  return (
    <header className="z-20 flex w-full items-center justify-between border-b border-white/10 bg-ink px-6 py-3.5 text-xs text-white/60">
      <div className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-success" aria-hidden="true" />
        <span className="text-[11px] font-medium tracking-wide text-white/70 uppercase">
          {t("utilityBar")}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">{t("utilityStep")}</span>
        <Link href="/help" className="font-medium text-white/80 transition-colors hover:text-white">
          {t("help")}
        </Link>
      </div>
    </header>
  );
}

/** Left brand panel: black with the skewed red accent, bilingual welcome copy. */
export function BrandPanel() {
  const t = useTranslations("auth.language.panel");
  return (
    <section className="relative flex w-full flex-col justify-between overflow-hidden bg-ink px-6 py-8 text-white lg:w-[48%] lg:p-14 xl:w-[45%] xl:p-16">
      {/* Bold red diagonal accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-20 z-0 h-80 w-80 bg-brand opacity-95 shadow-2xl lg:top-0 lg:bottom-0 lg:-right-32 lg:h-full lg:w-[480px] lg:-skew-x-12"
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3.5">
          <div
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-ink font-heading text-base font-extrabold">
              <span className="text-white">T</span>
              <span className="text-brand">P</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl leading-none font-extrabold tracking-tight select-none lg:text-3xl">
              Trip<span className="text-brand">Pay</span>
            </span>
            <span className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">
              {t("tagline")}
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="my-auto max-w-md py-4 lg:py-12">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {t("badge")}
          </p>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight uppercase sm:text-4xl lg:text-5xl">
            {t("welcome")}
            <span className="mt-1 block text-2xl font-bold text-white/50 sm:text-3xl lg:text-4xl">
              {t("welcomeAlt")}
            </span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
            {t("body")}
            <span className="mt-2 block text-xs text-white/50 sm:text-sm">{t("bodyAlt")}</span>
          </p>

          <div className="mt-8 hidden grid-cols-2 gap-3 border-t border-white/10 pt-8 text-xs text-white/70 lg:grid">
            <p className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-brand">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span className="money">{t("currencies")}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-brand">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
              </span>
              {t("protection")}
            </p>
          </div>
        </div>

        {/* Panel footer */}
        <div className="hidden items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50 lg:flex">
          <span>{t("copyright")}</span>
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="inline-block size-2 rounded-full bg-success" aria-hidden="true" />
            {t("cities")}
          </span>
        </div>
      </div>
    </section>
  );
}
