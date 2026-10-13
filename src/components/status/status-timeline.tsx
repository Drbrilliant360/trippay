import { useLocale, useTranslations } from "next-intl";
import type { TimelineEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

interface StatusTimelineProps {
  timeline: TimelineEntry[];
  className?: string;
}

export function StatusTimeline({ timeline, className }: StatusTimelineProps) {
  const t = useTranslations("status");
  const locale = useLocale();

  return (
    <ol className={cn("space-y-0", className)}>
      {timeline.map((entry, i) => {
        const isLast = i === timeline.length - 1;
        return (
          <li key={`${entry.status}-${entry.at}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-full",
                  isLast ? "bg-brand" : "bg-border",
                )}
                aria-hidden="true"
              />
              {!isLast && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
            </div>
            <div className={cn("pb-4", isLast && "pb-0")}>
              <p className={cn("text-sm", isLast ? "font-medium" : "text-muted-foreground")}>
                {t(entry.status)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(entry.at, locale)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
