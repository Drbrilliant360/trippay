"use client";

import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Wordmark } from "@/components/brand/wordmark";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  /** Highlight only on an exact path match (for index routes like "/app"). */
  exact?: boolean;
}

interface PortalSidebarProps {
  items: NavItem[];
  /** i18n namespace holding the item labels, e.g. "bizNav" */
  namespace: string;
  badge?: ReactNode;
}

function NavLinks({ items, namespace, onNavigate }: PortalSidebarProps & { onNavigate?: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations(namespace as any);
  const pathname = usePathname();
  return (
    <nav aria-label={t("navLabel")} className="flex flex-col gap-1 px-3">
      {items.map(({ href, labelKey, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon
              className="size-4.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
              aria-hidden="true"
            />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

/** Dark desktop-first sidebar used by the business and admin portals. */
export function PortalSidebar({ items, namespace, badge }: PortalSidebarProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations(namespace as any);
  const [open, setOpen] = useState(false);

  const header = (
    <div className="flex items-center gap-2 px-6 py-5">
      <Wordmark onDark />
      {badge}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        {header}
        <NavLinks items={items} namespace={namespace} />
        <div className="mt-auto px-6 py-4">
          <LocaleSwitcher onDark />
        </div>
      </aside>

      {/* Mobile: sheet menu */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("navLabel")}>
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
            <SheetHeader className="sr-only">
              <SheetTitle>
                <Wordmark onDark />
              </SheetTitle>
            </SheetHeader>
            {header}
            <NavLinks items={items} namespace={namespace} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
