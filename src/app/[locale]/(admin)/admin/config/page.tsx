"use client";

import { useTranslations } from "next-intl";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CONFIG_ROWS = [
  { id: "fee.mobile_money", valueKey: "feeMobileMoney" },
  { id: "fee.card", valueKey: "feeCard" },
  { id: "limit.daily_traveller", valueKey: "limitDaily" },
  { id: "limit.payout_dual_approval", valueKey: "limitDualApproval" },
] as const;

/** Fee/limit configuration. Changes need a reason and are audit-logged. */
export default function AdminConfigPage() {
  const t = useTranslations("admin.config");

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="space-y-2">
        {CONFIG_ROWS.map(({ id, valueKey }) => (
          <Card key={id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">{t(`rows.${valueKey}.label`)}</p>
                <p className="font-mono text-xs text-muted-foreground">{id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="money text-sm font-semibold">
                  {t(`rows.${valueKey}.value`)}
                </span>
                <Can
                  permission="admin.config.change"
                  fallback={
                    <span className="text-xs text-muted-foreground">
                      {t("noPermission")}
                    </span>
                  }
                >
                  <ReasonDialog
                    action="config.changed"
                    targetId={id}
                    title={t("changeTitle", { label: t(`rows.${valueKey}.label`) })}
                    description={t("changeBody")}
                    trigger={
                      <Button size="sm" variant="outline">
                        {t("change")}
                      </Button>
                    }
                  />
                </Can>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{t("dualApprovalNote")}</p>
    </div>
  );
}
