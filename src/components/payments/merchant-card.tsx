import { useTranslations } from "next-intl";
import { BadgeCheck, ShieldQuestion } from "lucide-react";
import type { MerchantSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MerchantCardProps {
  merchant: MerchantSummary;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Verified-recipient card shown before any payment. */
export function MerchantCard({ merchant, className }: MerchantCardProps) {
  const t = useTranslations("pay");
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3",
        merchant.verified ? "bg-success-soft" : "bg-pending-soft",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink font-heading text-sm font-bold text-white">
        {initials(merchant.name)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium">{merchant.name}</p>
        <p
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            merchant.verified ? "text-success" : "text-pending",
          )}
        >
          {merchant.verified ? (
            <BadgeCheck className="size-3.5" aria-hidden="true" />
          ) : (
            <ShieldQuestion className="size-3.5" aria-hidden="true" />
          )}
          {merchant.verified ? t("verifiedBusiness") : t("unverifiedBusiness")}
          {merchant.location ? ` · ${merchant.location}` : ""}
        </p>
      </div>
    </div>
  );
}
