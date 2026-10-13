import { cn } from "@/lib/utils";

interface DiagonalShapeProps {
  className?: string;
}

/**
 * Brand motif: a red/black diagonal split. Decorative only — used in heroes,
 * onboarding and empty states, never as a status indicator.
 */
export function DiagonalShape({ className }: DiagonalShapeProps) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)}>
      <div
        className="absolute inset-0 bg-brand"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
      <div
        className="absolute inset-0 bg-ink"
        style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
      />
    </div>
  );
}

/** Small corner accent, e.g. the top-right corner of a result card. */
export function DiagonalCorner({ className }: DiagonalShapeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute top-0 right-0 size-24", className)}
    >
      <div
        className="absolute inset-0 bg-brand"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
    </div>
  );
}
