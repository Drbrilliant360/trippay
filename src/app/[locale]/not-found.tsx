import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";

/** Localized 404 for unknown paths inside a valid locale. */
export default function NotFoundPage() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Wordmark />
      <div>
        <SearchX className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-3 font-heading text-2xl font-bold">{t("notFoundTitle")}</h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {t("notFoundBody")}
        </p>
      </div>
      <Button asChild>
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </div>
  );
}
