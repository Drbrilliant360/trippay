import type { UserRole } from "./types";

export type Permission =
  | "biz.requests.create"
  | "biz.payouts.create"
  | "biz.payouts.approve"
  | "biz.reports.export"
  | "biz.team.manage"
  | "biz.settings.manage"
  | "admin.verification.review"
  | "admin.transactions.search"
  | "admin.disputes.resolve"
  | "admin.refunds.issue"
  | "admin.config.change"
  | "admin.roles.manage"
  | "admin.audit.read";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  traveller: [],
  biz_owner: [
    "biz.requests.create",
    "biz.payouts.create",
    "biz.payouts.approve",
    "biz.reports.export",
    "biz.team.manage",
    "biz.settings.manage",
  ],
  biz_finance: [
    "biz.requests.create",
    "biz.payouts.create",
    "biz.reports.export",
  ],
  biz_staff: ["biz.requests.create"],
  admin_support: ["admin.transactions.search", "admin.audit.read"],
  admin_risk: [
    "admin.transactions.search",
    "admin.disputes.resolve",
    "admin.refunds.issue",
    "admin.verification.review",
    "admin.audit.read",
  ],
  admin_super: [
    "admin.verification.review",
    "admin.transactions.search",
    "admin.disputes.resolve",
    "admin.refunds.issue",
    "admin.config.change",
    "admin.roles.manage",
    "admin.audit.read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
