import type { ReactNode } from "react";

/**
 * Pass-through root layout. The locale layout in `[locale]/layout.tsx` renders
 * <html>/<body>; this file exists so Next can build root-level entries such as
 * the implicit /_not-found route (the build fails without a root layout).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
