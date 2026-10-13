/*
 * ============================================================================
 * MOBILE VERSION — DISABLED (2026-10-13)
 * ============================================================================
 * Product decision: the traveller experience is being built as a desktop-first
 * WEB app for now. The mobile bottom navigation below is kept for reference
 * and can be restored by uncommenting this file and re-enabling the mobile
 * shell in `traveller-shell.tsx`.
 * ============================================================================

"use client";

import { useTranslations } from "next-intl";
import { CircleDollarSign, Home, ReceiptText, User, Wallet } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", key: "home", icon: Home, exact: true },
  { href: "/app/wallet", key: "wallet", icon: Wallet, exact: false },
  { href: "/app/pay", key: "pay", icon: CircleDollarSign, exact: false },
  { href: "/app/transactions", key: "activity", icon: ReceiptText, exact: false },
  { href: "/app/profile", key: "profile", icon: User, exact: false },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("mainNav")}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ href, key, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const isPay = key === "pay";
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                active ? "text-brand" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isPay ? (
                <span
                  className={cn(
                    "-mt-5 flex size-12 items-center justify-center rounded-full border-4 border-card shadow-md",
                    active ? "bg-ink text-white" : "bg-brand text-white",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              ) : (
                <Icon className="size-5" aria-hidden="true" />
              )}
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
*/

// Intentionally no exports while the mobile version is disabled.
export {};
