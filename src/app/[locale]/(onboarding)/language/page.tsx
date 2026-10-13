"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Info } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/motion";
import { SkipLink } from "@/components/shared/skip-link";
import { cn } from "@/lib/utils";
import { BrandPanel, UtilityBar } from "./brand-panel";

// Language names are endonyms by convention, so they are not translated.
const LANGUAGES = [
  { locale: "en", flag: "🇬🇧", name: "English" },
  { locale: "sw", flag: "🇹🇿", name: "Kiswahili" },
] as const;

const STEPS = ["s1", "s2", "s3", "s4"] as const;

export default function LanguagePage() {
  const t = useTranslations("auth.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SkipLink />
      <UtilityBar />

      <main id="main" className="flex w-full flex-1 flex-col overflow-hidden lg:flex-row">
        <BrandPanel />

        {/* Right panel: language selection card */}
        <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-12 lg:py-16">
          <Reveal
            staggerMs={70}
            className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl shadow-black/5 sm:rounded-3xl sm:p-10"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
                {t("stepChip")}
              </span>
              <span className="text-xs font-medium text-muted-foreground">{t("stepCount")}</span>
            </div>

            <h2 className="font-heading text-2xl leading-tight font-extrabold tracking-tight uppercase sm:text-3xl">
              {t("title")}
              <span className="block text-xl font-bold text-muted-foreground sm:text-2xl">
                {t("titleAlt")}
              </span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("subtitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground/80">{t("subtitleAlt")}</p>

            {/* Language options */}
            <div className="mt-8 space-y-3.5" role="radiogroup" aria-label={t("title")}>
              {LANGUAGES.map(({ locale: l, flag, name }) => {
                const selected = l === locale;
                return (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => router.replace(pathname, { locale: l })}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all sm:p-5",
                      selected
                        ? "border-brand bg-brand/5 shadow-sm"
                        : "border-border bg-card hover:border-ink/40 hover:shadow-sm",
                    )}
                  >
                    <span className="flex items-center gap-3.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-11 items-center justify-center rounded-xl border text-lg transition-transform group-hover:scale-105",
                          selected ? "border-brand/30 bg-card" : "border-border bg-muted",
                        )}
                      >
                        {flag}
                      </span>
                      <span>
                        <span className="flex items-center gap-2">
                          <span className="font-heading text-lg font-extrabold tracking-tight">
                            {name}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                              l === "en"
                                ? "bg-brand text-white"
                                : "border border-success/30 bg-success-soft text-success",
                            )}
                          >
                            {t(`options.${l}.badge`)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {t(`options.${l}.description`)}
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                        selected ? "border-brand" : "border-border group-hover:border-ink/40",
                      )}
                    >
                      {selected && <span className="size-3 rounded-full bg-brand" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Support assurance note */}
            <p className="mt-6 flex items-start gap-2.5 rounded-xl border bg-muted p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{t("supportNote")}</span>
            </p>

            <Button asChild size="lg" className="mt-8 w-full font-heading text-base tracking-wider uppercase">
              <Link href="/signup">
                {t("continue")}
                <ArrowRight
                  data-icon="inline-end"
                  aria-hidden="true"
                  className="transition-transform group-hover/button:translate-x-1"
                />
              </Link>
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {t("haveAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold text-brand underline underline-offset-2 hover:no-underline"
              >
                {t("loginLink")}
              </Link>
            </p>

            {/* Step indicator */}
            <div className="mt-10 flex flex-col items-center gap-3 border-t pt-6">
              <div className="flex items-center gap-2.5" aria-label={t("progressAria")}>
                {STEPS.map((step, i) => (
                  <span
                    key={step}
                    className={cn(
                      "h-2.5 rounded-full transition-all",
                      i === 0 ? "w-8 bg-brand" : "w-2.5 bg-border",
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="flex w-full items-center justify-between px-2 text-[11px] font-medium text-muted-foreground">
                {STEPS.map((step, i) => (
                  <span key={step} className={cn(i === 0 && "font-bold text-brand")}>
                    {t(`steps.${step}`)}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
