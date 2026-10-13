"use client";

import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { hasPermission, type Permission } from "@/lib/permissions";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ADMIN_ROLES: UserRole[] = ["admin_support", "admin_risk", "admin_super"];

const PERMISSIONS: Permission[] = [
  "admin.transactions.search",
  "admin.verification.review",
  "admin.disputes.resolve",
  "admin.refunds.issue",
  "admin.config.change",
  "admin.roles.manage",
  "admin.audit.read",
];

export default function AdminRolesPage() {
  const t = useTranslations("admin.roles");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("permission")}</TableHead>
              {ADMIN_ROLES.map((role) => (
                <TableHead key={role} className="text-center">
                  {t(`roleNames.${role}`)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERMISSIONS.map((permission) => (
              <TableRow key={permission}>
                <TableCell className="text-sm">
                  {t(`permissions.${permission.replaceAll(".", "_")}`)}
                </TableCell>
                {ADMIN_ROLES.map((role) => {
                  const granted = hasPermission(role, permission);
                  return (
                    <TableCell key={role} className="text-center">
                      {granted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <Check className="size-4" aria-hidden="true" />
                          {t("granted")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Minus className="size-4" aria-hidden="true" />
                          {t("notGranted")}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">{t("manageNote")}</p>
    </div>
  );
}
