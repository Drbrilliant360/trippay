"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@/lib/types";

const RoleContext = createContext<User | null>(null);

export function RoleProvider({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  return <RoleContext.Provider value={user}>{children}</RoleContext.Provider>;
}

export function useCurrentUser(): User | null {
  return useContext(RoleContext);
}
