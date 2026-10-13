import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { SkipLink } from "@/components/shared/skip-link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <SkipLink />
      <PublicHeader />
      <main id="main" className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
      <PublicFooter />
    </div>
  );
}

function PublicHeader() {
  const t = useTranslations("public");
  return (
    <header className="sticky top-0 z-30 bg-ink text-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label="TripPay">
          <Wordmark onDark />
        </Link>
        <nav
          aria-label={t("navLabel")}
          className="hidden items-center gap-6 text-sm font-medium sm:flex"
        >
          <Link href="/tourists" className="text-white/80 hover:text-white">
            {t("nav.tourists")}
          </Link>
          <Link href="/businesses" className="text-white/80 hover:text-white">
            {t("nav.businesses")}
          </Link>
          <Link href="/#how-it-works" className="text-white/80 hover:text-white">
            {t("nav.howItWorks")}
          </Link>
          <Link href="/help" className="text-white/80 hover:text-white">
            {t("nav.support")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher onDark />
          <Link
            href="/login"
            className="text-sm font-medium underline underline-offset-4 hover:text-white/80"
          >
            {t("nav.login")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  const t = useTranslations("public");
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Wordmark onDark />
            <p className="mt-1 text-sm text-white/60">{t("tagline")}</p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm text-white/70 underline underline-offset-4 hover:text-white"
            >
              www.trippay.com
            </Link>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <nav
              aria-label={t("footer.navLabel")}
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70"
            >
              <Link href="/legal" className="underline underline-offset-4 hover:text-white">
                {t("footer.terms")}
              </Link>
              <Link href="/legal" className="underline underline-offset-4 hover:text-white">
                {t("footer.privacy")}
              </Link>
              <Link href="/help" className="underline underline-offset-4 hover:text-white">
                {t("footer.fees")}
              </Link>
              <Link href="/help" className="underline underline-offset-4 hover:text-white">
                {t("footer.complaints")}
              </Link>
              <Link href="/help" className="underline underline-offset-4 hover:text-white">
                {t("footer.contact")}
              </Link>
            </nav>
            <LocaleSwitcher onDark />
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4">
          <p className="text-xs text-white/40">{t("footer.copyright")}</p>
          <p className="mt-1 text-xs text-white/40">{t("demoDisclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
