import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { SkipLink } from "@/components/shared/skip-link";

/**
 * Onboarding/auth chrome: a plain white top bar with the wordmark and the
 * language switcher over the grey page background. Each page sets its own
 * content width (narrow forms vs. the wide verification layout).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" aria-label="TripPay">
            <Wordmark />
          </Link>
          <LocaleSwitcher />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14">{children}</main>
    </div>
  );
}
