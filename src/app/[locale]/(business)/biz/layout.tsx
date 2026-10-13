import { BusinessShell } from "@/components/layout/business-shell";

export default function BizLayout({ children }: { children: React.ReactNode }) {
  return <BusinessShell>{children}</BusinessShell>;
}
