"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  onDark?: boolean;
}

export function LocaleSwitcher({ onDark = false }: LocaleSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchTo(next: string) {
    // Re-resolve the current URL (including dynamic params) in the new locale
    router.replace(
      // @ts-expect-error params match the current pathname's dynamic segments
      { pathname, params },
      { locale: next },
    );
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "inline-flex rounded-full border p-0.5 text-xs font-medium",
        onDark ? "border-white/20" : "border-border bg-card",
      )}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            l === locale
              ? "bg-brand text-white"
              : onDark
                ? "text-white/70 hover:text-white"
                : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
