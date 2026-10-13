"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { Wordmark } from "@/components/brand/wordmark";

/**
 * Route-level error boundary: anything a page throws lands here instead of a
 * blank screen. Reset re-renders the failed segment.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    // Surface the error during development; a real backend would report it.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <Wordmark />
      <ErrorState onRetry={reset} className="w-full max-w-md" />
      <Button asChild variant="ghost">
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </div>
  );
}
