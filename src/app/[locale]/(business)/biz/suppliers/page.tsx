"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Info, Plus, Truck } from "lucide-react";
import { listPayouts, listSuppliers } from "@/lib/api/business";
import { formatDate } from "@/lib/datetime";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/shared/page-header";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApprovalQueue } from "./approval-queue";
import { PayoutSheet } from "./payout-sheet";

export default function BizSuppliersPage() {
  const t = useTranslations("bizSuppliers");
  const locale = useLocale();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const suppliers = useQuery({ queryKey: ["biz-suppliers"], queryFn: listSuppliers });
  const payouts = useQuery({ queryKey: ["biz-payouts"], queryFn: listPayouts });

  const queueCount =
    payouts.data?.filter((p) => p.status === "awaiting_authorisation").length ?? 0;

  function openPaySheet(supplierId: string) {
    setSelectedSupplierId(supplierId);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus data-icon="inline-start" aria-hidden="true" />
                {t("addSupplier")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addSupplier")}</DialogTitle>
                <DialogDescription>{t("addSupplierExplainer")}</DialogDescription>
              </DialogHeader>
              <div className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-sm text-info">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>{t("addSupplierMockNote")}</p>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">{t("tabs.directory")}</TabsTrigger>
          <TabsTrigger value="queue">
            {t("tabs.queue")}
            {queueCount > 0 && (
              <Badge className="ml-1.5 bg-brand text-white">{queueCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-4 space-y-6">
          {suppliers.isPending ? (
            <ListSkeleton rows={4} />
          ) : suppliers.isError ? (
            <ErrorState onRetry={() => suppliers.refetch()} />
          ) : suppliers.data.length === 0 ? (
            <EmptyState icon={Truck} title={t("emptyTitle")} description={t("emptyBody")} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <Table aria-label={t("tabs.directory")}>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">{t("table.supplier")}</TableHead>
                    <TableHead>{t("table.type")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.method")}</TableHead>
                    <TableHead>{t("table.lastPaid")}</TableHead>
                    <TableHead className="pr-5 text-right">
                      <span className="sr-only">{t("table.actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.data.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="pl-5 font-medium">{supplier.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {supplier.category}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={supplier.verified ? "verified" : "under_review"} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t("methodMasked", {
                          method: t(`methods.${supplier.payoutMethod.type}`),
                          last3: supplier.payoutMethod.last3,
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {supplier.lastPaidAt ? formatDate(supplier.lastPaidAt, locale) : "—"}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <Can permission="biz.payouts.create">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!supplier.verified}
                            onClick={() => openPaySheet(supplier.id)}
                          >
                            {t("table.pay")}
                          </Button>
                        </Can>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          {payouts.isPending ? (
            <ListSkeleton rows={2} rowClassName="h-28" />
          ) : payouts.isError ? (
            <ErrorState onRetry={() => payouts.refetch()} />
          ) : (
            <ApprovalQueue payouts={payouts.data} />
          )}
        </TabsContent>
      </Tabs>

      <section aria-labelledby="payout-history" className="space-y-2">
        <h2 id="payout-history" className="font-heading font-bold">
          {t("payoutsTitle")}
        </h2>
        {payouts.isPending ? (
          <ListSkeleton rows={2} />
        ) : payouts.isError ? (
          <ErrorState onRetry={() => payouts.refetch()} />
        ) : (
          <div className="space-y-2">
            {payouts.data
              .filter((p) => p.status !== "awaiting_authorisation")
              .map((payout) => (
                <div
                  key={payout.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{payout.supplier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payout.createdAt, locale)}
                      {payout.ref ? ` · ${payout.ref}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoneyAmount money={payout.total} className="font-semibold" />
                    <StatusChip status={payout.status} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <PayoutSheet
        suppliers={suppliers.data ?? []}
        supplierId={selectedSupplierId}
        onSupplierChange={setSelectedSupplierId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
