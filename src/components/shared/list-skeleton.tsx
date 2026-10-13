import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  rows?: number;
  /** Height of each row in Tailwind units, e.g. "h-16". */
  rowClassName?: string;
}

export function ListSkeleton({ rows = 4, rowClassName = "h-16" }: ListSkeletonProps) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`${rowClassName} w-full rounded-2xl`} />
      ))}
    </div>
  );
}
