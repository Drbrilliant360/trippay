"use client";

import type { ReactNode } from "react";
import { hasPermission, type Permission } from "@/lib/permissions";
import { useCurrentUser } from "./role-provider";

interface CanProps {
  permission: Permission;
  children: ReactNode;
  /** Rendered when the role lacks the permission (default: nothing). */
  fallback?: ReactNode;
}

/**
 * Role-based UI gate, driven by the mock user's role. The frontend is never
 * the authority for permissions — the backend re-checks every action.
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const user = useCurrentUser();
  if (!user || !hasPermission(user.role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
