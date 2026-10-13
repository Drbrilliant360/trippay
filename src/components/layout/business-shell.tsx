"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  QrCode,
  ReceiptText,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import { getBusinessUser } from "@/lib/api/auth";
import { getBusiness } from "@/lib/api/business";
import { RoleProvider } from "@/components/auth/role-provider";
import { Badge } from "@/components/ui/badge";
import { SkipLink } from "@/components/shared/skip-link";
import { PortalSidebar, type NavItem } from "./portal-sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/biz/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/biz/requests", labelKey: "requests", icon: QrCode },
  { href: "/biz/transactions", labelKey: "transactions", icon: ReceiptText },
  { href: "/biz/suppliers", labelKey: "suppliers", icon: Truck },
  { href: "/biz/settlements", labelKey: "settlements", icon: FileText },
  { href: "/biz/reports", labelKey: "reports", icon: BarChart3 },
  { href: "/biz/team", labelKey: "team", icon: Users },
  { href: "/biz/settings", labelKey: "settings", icon: Settings },
  { href: "/biz/support", labelKey: "support", icon: LifeBuoy },
];

/** Desktop-first dashboard shell for the business portal. */
export function BusinessShell({ children }: { children: ReactNode }) {
  const t = useTranslations("bizNav");
  const { data: user } = useQuery({
    queryKey: ["biz-user"],
    queryFn: getBusinessUser,
  });
  const { data: business } = useQuery({
    queryKey: ["business"],
    queryFn: getBusiness,
  });

  return (
    <RoleProvider user={user ?? null}>
      <div className="min-h-dvh lg:pl-60">
        <SkipLink />
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-card px-4 lg:px-8">
          <PortalSidebar
            items={NAV_ITEMS}
            namespace="bizNav"
            badge={
              <span className="font-heading text-[10px] font-semibold tracking-widest text-white/50 uppercase">
                {t("portalBadge")}
              </span>
            }
          />
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">{business?.name ?? "…"}</span>
            {business?.verified && (
              <Badge className="bg-success-soft text-success">{t("verified")}</Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">{user?.name ?? ""}</span>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </RoleProvider>
  );
}
