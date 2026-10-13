import Image from "next/image";
import { useTranslations } from "next-intl";
import { BadgePercent, Headphones, Lock, ReceiptText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Float, Reveal } from "@/components/motion/motion";
import { HeroPhone } from "./hero-phone";
import { AudienceCards } from "./audience-cards";

const HOW_STEPS = ["account", "verify", "fund", "pay"] as const;

const TRUST_ITEMS = [
  { key: "secure", icon: Lock },
  { key: "fees", icon: BadgePercent },
  { key: "receipts", icon: ReceiptText },
  { key: "support", icon: Headphones },
] as const;

export default function LandingPage() {
  const t = useTranslations("landing");
  const kickerParts = t("hero.kicker").split("•");

  return (
    // Full-bleed bands; the inner containers re-apply the page gutter.
    <div className="mx-[calc(50%-50vw)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-brand lg:block"
          style={{ clipPath: "polygon(45% 0, 100% 0, 100% 100%, 75% 100%)" }}
        />
        <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 sm:py-16 lg:grid-cols-2">
          <Reveal>
            <p className="font-heading text-sm font-semibold tracking-widest uppercase">
              {kickerParts.map((part, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-brand">•</span>}
                  {part}
                </span>
              ))}
            </p>
            <h1 className="mt-3 max-w-xl font-heading text-4xl font-extrabold uppercase sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-md text-white/70">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/language">{t("hero.ctaPrimary")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/businesses">{t("hero.ctaSecondary")}</Link>
              </Button>
            </div>
          </Reveal>
          <div className="relative hidden justify-end sm:flex">
            <div className="relative min-h-[320px] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/images/hero-kilimanjaro.jpg"
                alt={t("hero.photoAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 60vw, 420px"
                className="object-cover"
              />
            </div>
            <Float className="absolute -right-2 -bottom-6 lg:-right-6">
              <HeroPhone />
            </Float>
          </div>
        </div>
      </section>

      {/* For tourists / for businesses */}
      <section className="bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <AudienceCards />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="scroll-mt-20 bg-background"
      >
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="how-heading" className="font-heading text-3xl font-extrabold uppercase">
            {t("how.title")}
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((step, i) => (
              <li
                key={step}
                className={cn("border-t-4 pt-4", i === 0 ? "border-brand" : "border-ink")}
              >
                <p
                  className={cn(
                    "font-heading text-3xl font-extrabold",
                    i === 0 && "text-brand",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-heading font-bold">{t(`how.steps.${step}.title`)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`how.steps.${step}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust + planned partners */}
      <section aria-labelledby="trust-heading" className="bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="trust-heading" className="font-heading text-3xl font-extrabold uppercase">
            {t("trust.title")}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map(({ key, icon: Icon }) => (
              <div key={key} className="rounded-2xl border bg-card p-5">
                <Icon className="size-6 text-brand" aria-hidden="true" />
                <h3 className="mt-3 font-heading font-bold">{t(`trust.${key}.title`)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(`trust.${key}.body`)}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("partners.title")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-14 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground"
              >
                {t("partners.placeholder")}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action over the balloon-safari photo */}
      <section aria-labelledby="cta-heading" className="relative overflow-hidden bg-ink">
        <Image
          src="/images/cta-balloon.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center text-white">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl font-heading text-3xl font-extrabold uppercase sm:text-4xl"
          >
            {t("cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">{t("cta.body")}</p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/language">{t("cta.button")}</Link>
          </Button>
        </div>
      </section>

      {/* Prototype demo entry points */}
      <section aria-labelledby="demo-heading" className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 id="demo-heading" className="font-heading text-xl font-bold">
              {t("demo.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("demo.subtitle")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/app">{t("demo.traveller")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/biz/dashboard">{t("demo.business")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin/overview">{t("demo.admin")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
