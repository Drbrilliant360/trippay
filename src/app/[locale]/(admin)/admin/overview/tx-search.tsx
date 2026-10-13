"use client";

import { Fragment, useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  performSensitiveAction,
  searchAdminTransactions,
  type AdminTxRow,
} from "@/lib/api/admin";
import { formatTime } from "@/lib/datetime";
import { maskName, maskPhone } from "@/lib/mask";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Can } from "@/components/auth/can";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyAmount } from "@/components/money/money-amount";
import { StatusChip } from "@/components/status/status-chip";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { RefundDialog } from "./refund-dialog";

/** Ops transaction search with a masked-by-default detail panel. */
export function TxSearch() {
  const t = useTranslations("admin.overview.search");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  const results = useQuery({
    queryKey: ["admin-tx-rows", debouncedQuery],
    queryFn: () => searchAdminTransactions(debouncedQuery),
    // Keep the current rows on screen while the next search loads.
    placeholderData: keepPreviousData,
  });

  const selected =
    results.data?.find((row) => row.id === selectedId) ?? results.data?.[0] ?? null;

  return (
    <div className="space-y-6">
      <section aria-labelledby="tx-search-heading" className="rounded-2xl border bg-card p-5">
        <h2 id="tx-search-heading" className="font-heading text-lg font-bold">
          {t("title")}
        </h2>
        <div className="relative mt-3">
          <Search
            className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="h-12 rounded-xl pl-10"
          />
          {/* Previous rows stay visible while the next search loads. */}
          {results.isFetching && !results.isPending && (
            <Loader2
              className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          {results.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          ) : results.isError ? (
            <ErrorState onRetry={() => results.refetch()} />
          ) : results.data.length === 0 ? (
            <EmptyState icon={Search} title={t("emptyTitle")} description={t("emptyBody")} />
          ) : (
            <Table aria-label={t("title")}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("columns.reference")}</TableHead>
                  <TableHead>{t("columns.user")}</TableHead>
                  <TableHead>{t("columns.phone")}</TableHead>
                  <TableHead>{t("columns.merchant")}</TableHead>
                  <TableHead className="text-right">{t("columns.amount")}</TableHead>
                  <TableHead>{t("columns.provider")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.data.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={cn(
                      "cursor-pointer",
                      selected?.id === row.id && "bg-brand/5 hover:bg-brand/10",
                    )}
                  >
                    <TableCell className="money font-medium">{row.reference}</TableCell>
                    <TableCell>{maskName(row.userName)}</TableCell>
                    <TableCell className="money text-muted-foreground">
                      {maskPhone(row.userPhone)}
                    </TableCell>
                    <TableCell>{row.merchant}</TableCell>
                    <TableCell className="text-right">
                      <MoneyAmount money={row.amount} className="font-medium" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.provider}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell className="money text-muted-foreground">
                      {formatTime(row.createdAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      {/* Keyed by row id so the PII "revealed" state resets per transaction. */}
      {selected && <TxDetail key={selected.id} row={selected} />}
    </div>
  );
}

function TxDetail({ row }: { row: AdminTxRow }) {
  const t = useTranslations("admin.overview.detail");
  const locale = useLocale();
  const [revealed, setRevealed] = useState(false);

  const reveal = useMutation({
    mutationFn: () =>
      performSensitiveAction({
        action: "pii.phone_revealed",
        targetId: row.reference,
        reason: "Support lookup from the operations overview",
      }),
    onSuccess: () => {
      setRevealed(true);
      toast.info(t("revealLogged"));
    },
  });

  const lastStep = row.timeline[row.timeline.length - 1];

  return (
    <section aria-labelledby="tx-detail-heading" className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="tx-detail-heading" className="money font-heading text-lg font-bold">
          {row.reference}
        </h2>
        <div className="flex items-center gap-2">
          <Can permission="admin.refunds.issue">
            <RefundDialog row={row} />
          </Can>
          <Can permission="admin.refunds.issue">
            <ReasonDialog
              action="payment.reversed"
              targetId={row.reference}
              title={t("reverseTitle", { reference: row.reference })}
              description={t("reverseBody")}
              trigger={
                <Button type="button" variant="outline" size="sm">
                  {t("reverse")}
                </Button>
              }
            />
          </Can>
          <Can permission="admin.disputes.resolve">
            <ReasonDialog
              action="transaction.flagged"
              targetId={row.reference}
              title={t("flagTitle", { reference: row.reference })}
              description={t("flagBody")}
              trigger={
                <Button type="button" size="sm">
                  {t("flag")}
                </Button>
              }
            />
          </Can>
        </div>
      </div>

      <dl className="mt-4 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="text-muted-foreground">{t("user")}</dt>
        <dd>
          {maskName(row.userName)} · <span className="money">{row.userId}</span>
        </dd>

        <dt className="text-muted-foreground">{t("phone")}</dt>
        <dd className="money">
          {revealed ? row.userPhone : maskPhone(row.userPhone)}{" "}
          {!revealed && (
            <button
              type="button"
              onClick={() => reveal.mutate()}
              disabled={reveal.isPending}
              className="ml-1 font-sans text-brand underline underline-offset-2 hover:no-underline disabled:opacity-50"
            >
              {t("reveal")}
            </button>
          )}
        </dd>

        <dt className="text-muted-foreground">{t("amount")}</dt>
        <dd>
          <MoneyAmount money={row.amount} className="font-semibold" /> +{" "}
          {t("fee")} <MoneyAmount money={row.fee} className="font-semibold" />
        </dd>

        <dt className="text-muted-foreground">{t("providerRef")}</dt>
        <dd className="money">{row.providerRef}</dd>

        <dt className="text-muted-foreground">{t("timeline")}</dt>
        <dd className="flex flex-wrap items-center gap-1.5">
          {row.timeline.map((entry, i) => (
            <Fragment key={entry.step}>
              {i > 0 && (
                <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
              )}
              <span
                className={cn(
                  entry.step === lastStep.step &&
                    (row.status === "pending"
                      ? "font-semibold text-pending"
                      : row.status === "failed"
                        ? "font-semibold text-failed"
                        : "font-semibold text-success"),
                )}
              >
                {t(`steps.${entry.step}`)}
                {entry.at ? (
                  <span className="money"> {formatTime(entry.at, locale)}</span>
                ) : null}
              </span>
            </Fragment>
          ))}
        </dd>
      </dl>
    </section>
  );
}
