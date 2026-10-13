"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  Bell,
  CircleDollarSign,
  Home,
  Landmark,
  LifeBuoy,
  LineChart,
  PiggyBank,
  ReceiptText,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTravellerUser } from "@/lib/api/auth";
import { RoleProvider } from "@/components/auth/role-provider";
import { Button } from "@/components/ui/button";
import { SkipLink } from "@/components/shared/skip-link";
import { PortalSidebar, type NavItem } from "./portal-sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/app", labelKey: "home", icon: Home, exact: true },
  { href: "/app/wallet", labelKey: "wallet", icon: Wallet },
  { href: "/app/pay", labelKey: "pay", icon: CircleDollarSign },
  { href: "/app/transactions", labelKey: "activity", icon: ReceiptText },
  { href: "/app/savings", labelKey: "savings", icon: PiggyBank },
  { href: "/app/rates", labelKey: "rates", icon: LineChart },
  { href: "/app/transfer", labelKey: "transfer", icon: ArrowLeftRight },
  { href: "/app/financing", labelKey: "financing", icon: Landmark },
  { href: "/app/assistant", labelKey: "assistant", icon: Sparkles },
  { href: "/app/support", labelKey: "support", icon: LifeBuoy },
  { href: "/app/profile", labelKey: "profile", icon: User },
];

/**
 * Desktop-first WEB shell for the traveller app: dark sidebar + top bar,
 * consistent with the business and admin portals.
 */
export function TravellerShell({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const { data: user } = useQuery({
    queryKey: ["traveller-user"],
    queryFn: getTravellerUser,
  });

  return (
    <RoleProvider user={user ?? null}>
      <div className="min-h-dvh lg:pl-60">
        <SkipLink />
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-card px-4 lg:px-8">
          <PortalSidebar items={NAV_ITEMS} namespace="nav" />
          <div className="ml-auto flex items-center gap-3">
            <Button asChild size="sm">
              <Link href="/app/pay">{t("pay")}</Link>
            </Button>
            <Link
              href="/app/notifications"
              aria-label={t("notifications")}
              className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <Bell className="size-5" aria-hidden="true" />
              <span
                className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand"
                aria-hidden="true"
              />
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.name ?? ""}
            </span>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </RoleProvider>
  );
}

/*
 * ============================================================================
 * MOBILE VERSION — DISABLED (2026-10-13)
 * ============================================================================
 * The original mobile-first shell (phone-width column + bottom navigation) is
 * kept below for reference. To restore it: uncomment this block and the
 * `BottomNav` component in `bottom-nav.tsx`, rename the component back to
 * `TravellerShell`, and remove the desktop shell above.
 * ============================================================================

import { Wordmark } from "@/components/brand/wordmark";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { BottomNav } from "./bottom-nav";

export function TravellerShellMobile({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const { data: user } = useQuery({
    queryKey: ["traveller-user"],
    queryFn: getTravellerUser,
  });

  return (
    <RoleProvider user={user ?? null}>
      <div className="min-h-dvh pb-24">
        <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
            <Link href="/app" aria-label={t("home")}>
              <Wordmark />
            </Link>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <Link
                href="/app/notifications"
                aria-label={t("notifications")}
                className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted"
              >
                <Bell className="size-5" aria-hidden="true" />
                <span
                  className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-md px-4 py-5">{children}</main>
        <BottomNav />
      </div>
    </RoleProvider>
  );
}
*/
