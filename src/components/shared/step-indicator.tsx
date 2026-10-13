"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  /** Localized step labels, in order. */
  steps: string[];
  /** 0-based index of the current step. */
  current: number;
  ariaLabel: string;
  className?: string;
}

/** Visual progress through a multi-step flow: done ✓ / current / upcoming. */
export function StepIndicator({ steps, current, ariaLabel, className }: StepIndicatorProps) {
  return (
    <ol className={cn("flex items-center gap-2", className)} aria-label={ariaLabel}>
      {steps.map((label, i) => (
        <li
          key={label}
          className="flex items-center gap-2"
          aria-current={i === current ? "step" : undefined}
        >
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full font-heading text-xs font-bold",
              i < current
                ? "bg-success text-white"
                : i === current
                  ? "bg-brand text-white"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i < current ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
          </span>
          {/* On phones only the current label is shown so long flows don't wrap. */}
          <span
            className={cn(
              "text-sm",
              i === current ? "font-medium" : "hidden text-muted-foreground sm:inline",
            )}
          >
            {label}
          </span>
          {i < steps.length - 1 && <span className="h-px w-6 bg-border" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
