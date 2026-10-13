import { cn } from "@/lib/utils";

interface WordmarkProps {
  /** Renders "Trip" in white instead of black, for dark surfaces. */
  onDark?: boolean;
  className?: string;
}

export function Wordmark({ onDark = false, className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-heading text-xl font-bold tracking-tight select-none",
        className,
      )}
    >
      <span className={onDark ? "text-white" : "text-ink"}>Trip</span>
      <span className="text-brand">Pay</span>
    </span>
  );
}
