"use client";

import { usePathname } from "@/i18n/navigation";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The login screen renders outside the portal shell
  if (pathname === "/admin/login") return <>{children}</>;
  return <AdminShell>{children}</AdminShell>;
}
