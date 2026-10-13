"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ onRetry, className }: ErrorStateProps) {
  const t = useTranslations("common");
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-failed/30 bg-failed-soft px-6 py-10 text-center",
        className,
      )}
    >
      <AlertTriangle className="mb-2 size-6 text-failed" aria-hidden="true" />
      <p className="font-medium text-failed">{t("errorTitle")}</p>
      <p className="mt-1 text-sm text-failed/80">{t("errorBody")}</p>
      {onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
