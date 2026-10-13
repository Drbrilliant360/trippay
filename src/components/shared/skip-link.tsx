import { useTranslations } from "next-intl";

/**
 * Keyboard users jump straight to the main content, past the navigation.
 * Visually hidden until focused. Pair with <main id="main">.
 */
export function SkipLink() {
  const t = useTranslations("common");
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3"
    >
      {t("skipToContent")}
    </a>
  );
}
