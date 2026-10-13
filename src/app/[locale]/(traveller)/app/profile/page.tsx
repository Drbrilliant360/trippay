"use client";

import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  ChevronRight,
  FileText,
  Globe,
  LifeBuoy,
  Lock,
  LogOut,
  Trash2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCurrentUser } from "@/components/auth/role-provider";
import { PageHeader } from "@/components/shared/page-header";
import { StatusChip } from "@/components/status/status-chip";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const user = useCurrentUser();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader title={t("title")} />

      {!user ? (
        <Skeleton className="h-28 w-full rounded-2xl" />
      ) : (
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-14 items-center justify-center rounded-full bg-ink font-heading text-lg font-bold text-white">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-heading text-lg font-bold">
                {user.name}
                {user.verificationStatus === "approved" && (
                  <BadgeCheck className="size-4.5 text-success" aria-hidden="true" />
                )}
              </p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
              <StatusChip status={user.verificationStatus} className="mt-1.5" />
            </div>
          </CardContent>
        </Card>
      )}

      <nav aria-label={t("settingsNav")} className="overflow-hidden rounded-2xl border bg-card">
        {[
          { key: "security", icon: Lock, href: "/app/profile" },
          { key: "language", icon: Globe, href: "/language" },
          { key: "legal", icon: FileText, href: "/legal" },
          { key: "support", icon: LifeBuoy, href: "/app/support" },
        ].map(({ key, icon: Icon, href }, i, arr) => (
          <Link
            key={key}
            href={href}
            className={`flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted ${
              i < arr.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Icon className="size-4.5 text-muted-foreground" aria-hidden="true" />
              {t(`links.${key}`)}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <div className="space-y-2">
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-full border bg-card p-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t("logout")}
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full p-3 text-sm font-medium text-failed transition-colors hover:bg-failed-soft"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t("closeAccount")}
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("closeAccount")}</DialogTitle>
              <DialogDescription>{t("closeAccountExplainer")}</DialogDescription>
            </DialogHeader>
            <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              {t("closeAccountMockNote")}
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
