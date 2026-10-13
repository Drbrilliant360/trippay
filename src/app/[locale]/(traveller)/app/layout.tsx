import { TravellerShell } from "@/components/layout/traveller-shell";

export default function TravellerLayout({ children }: { children: React.ReactNode }) {
  return <TravellerShell>{children}</TravellerShell>;
}
