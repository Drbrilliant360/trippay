import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Info,
  RotateCcw,
  SearchCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ChipStatus =
  | "created"
  | "awaiting_authorisation"
  | "pending"
  | "successful"
  | "failed"
  | "expired"
  | "reversed"
  | "refunded"
  | "under_review"
  | "open"
  | "paid"
  | "cancelled"
  | "active"
  | "paused"
  | "completed"
  | "settled"
  | "delayed"
  | "matched"
  | "mismatch"
  | "in_progress"
  | "operational"
  | "degraded"
  | "down"
  | "investigating"
  | "rejected"
  | "waiting"
  | "resolved"
  | "invited"
  | "suspended"
  | "approved"
  | "more_info"
  | "unverified"
  | "verified";

type Tone = "success" | "pending" | "failed" | "info" | "review" | "neutral";

const TONE_BY_STATUS: Record<ChipStatus, Tone> = {
  created: "neutral",
  awaiting_authorisation: "pending",
  pending: "pending",
  successful: "success",
  failed: "failed",
  expired: "neutral",
  reversed: "info",
  refunded: "info",
  under_review: "review",
  open: "info",
  paid: "success",
  cancelled: "neutral",
  active: "success",
  paused: "neutral",
  completed: "success",
  settled: "success",
  delayed: "pending",
  matched: "success",
  mismatch: "failed",
  in_progress: "pending",
  operational: "success",
  degraded: "pending",
  down: "failed",
  investigating: "review",
  rejected: "failed",
  waiting: "pending",
  resolved: "success",
  invited: "info",
  suspended: "failed",
  approved: "success",
  more_info: "pending",
  unverified: "neutral",
  verified: "success",
};

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  pending: "bg-pending-soft text-pending",
  failed: "bg-failed-soft text-failed",
  info: "bg-info-soft text-info",
  review: "bg-review-soft text-review",
  neutral: "bg-muted text-muted-foreground",
};

const TONE_ICONS: Record<Tone, typeof CheckCircle2> = {
  success: CheckCircle2,
  pending: Clock,
  failed: XCircle,
  info: Info,
  review: SearchCheck,
  neutral: CircleDashed,
};

// Overrides for statuses whose tone icon would be misleading
const ICON_OVERRIDES: Partial<Record<ChipStatus, typeof CheckCircle2>> = {
  reversed: RotateCcw,
  refunded: RotateCcw,
  degraded: AlertTriangle,
};

interface StatusChipProps {
  status: ChipStatus;
  className?: string;
}

/**
 * Status is never shown by colour alone: every chip carries an icon and a
 * plain-language label.
 */
export function StatusChip({ status, className }: StatusChipProps) {
  const t = useTranslations("status");
  const tone = TONE_BY_STATUS[status];
  const Icon = ICON_OVERRIDES[status] ?? TONE_ICONS[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {t(status)}
    </span>
  );
}
