"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Activity,
  BadgeCheck,
  Gauge,
  ScrollText,
  ScanSearch,
  Scale,
  Settings2,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { getAdminUser } from "@/lib/api/auth";
import { RoleProvider } from "@/components/auth/role-provider";
import { Badge } from "@/components/ui/badge";
import { SkipLink } from "@/components/shared/skip-link";
import { PortalSidebar, type NavItem } from "./portal-sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/overview", labelKey: "overview", icon: Gauge },
  { href: "/admin/transactions", labelKey: "transactions", icon: ScanSearch },
  { href: "/admin/verification", labelKey: "verification", icon: BadgeCheck },
  { href: "/admin/reconciliation", labelKey: "reconciliation", icon: Scale },
  { href: "/admin/providers", labelKey: "providers", icon: Activity },
  { href: "/admin/disputes", labelKey: "disputes", icon: ShieldAlert },
  { href: "/admin/config", labelKey: "config", icon: Settings2 },
  { href: "/admin/roles", labelKey: "roles", icon: UserCog },
  { href: "/admin/audit-log", labelKey: "auditLog", icon: ScrollText },
];

/** Internal admin portal shell — desktop only by design. */
export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("adminNav");
  const { data: user } = useQuery({
    queryKey: ["admin-user"],
    queryFn: getAdminUser,
  });

  return (
    <RoleProvider user={user ?? null}>
      <div className="min-h-dvh lg:pl-60">
        <SkipLink />
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-card px-4 lg:px-8">
          <PortalSidebar
            items={NAV_ITEMS}
            namespace="adminNav"
            badge={
              <span className="font-heading text-[10px] font-semibold tracking-widest text-white/50 uppercase">
                {t("portalBadge")}
              </span>
            }
          />
          <div className="ml-auto flex items-center gap-3">
            <Badge className="bg-pending font-heading tracking-widest text-white uppercase">
              {t("environment")}
            </Badge>
            <div className="text-right">
              <p className="text-sm leading-tight font-medium">{user?.name ?? ""}</p>
              <p className="text-xs leading-tight text-muted-foreground">
                {user ? t(`roleLabels.${user.role}`) : ""}
              </p>
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </RoleProvider>
  );
}
