import { useTranslations } from "next-intl";
import { Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComingSoonBadgeProps {
  className?: string;
}

/** Marks gated features. They are shown, explained, and never functional. */
export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  const t = useTranslations("common");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-white",
        className,
      )}
    >
      <Hourglass className="size-3" aria-hidden="true" />
      {t("comingSoon")}
    </span>
  );
}
