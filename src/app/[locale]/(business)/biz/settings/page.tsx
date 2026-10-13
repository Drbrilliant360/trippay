"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getBusiness } from "@/lib/api/business";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { StatusChip } from "@/components/status/status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/copy-button";

export default function BizSettingsPage() {
  const t = useTranslations("bizSettings");
  const business = useQuery({ queryKey: ["business"], queryFn: getBusiness });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {business.isPending ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : business.isError ? (
        <ErrorState onRetry={() => business.refetch()} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("profileTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name">{t("name")}</Label>
                <Input id="biz-name" defaultValue={business.data.name} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-category">{t("category")}</Label>
                <Input id="biz-category" defaultValue={business.data.category} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>{t("code")}</Label>
                <p className="flex items-center gap-1 font-mono text-sm">
                  {business.data.code}
                  <CopyButton value={business.data.code} />
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>{t("verification")}</Label>
                <div>
                  <StatusChip status={business.data.verificationStatus} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t("editNote")}</p>
            </CardContent>
          </Card>

          <Can permission="biz.settings.manage">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("payoutTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-settle-method">{t("settlementMethod")}</Label>
                  <Input
                    id="biz-settle-method"
                    defaultValue={t("settlementMethodValue")}
                    disabled
                  />
                </div>
                <Button type="button" variant="outline" size="sm" disabled>
                  {t("requestChange")}
                </Button>
                <p className="text-xs text-muted-foreground">{t("payoutNote")}</p>
              </CardContent>
            </Card>
          </Can>
        </>
      )}
    </div>
  );
}
