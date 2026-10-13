"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, Download, Link2, Send } from "lucide-react";
import { toast } from "sonner";
import type { Money, PaymentRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { QrSvg } from "@/components/payments/qr-code-card";
import { MoneyAmount } from "@/components/money/money-amount";

export interface PreviewDraft {
  bookingRef: string;
  description: string;
  expiryLabel: string;
  customerContact?: string;
  /** Customer total from the API quote; null while the amount is invalid. */
  customerTotal: Money | null;
}

interface RequestPreviewProps {
  businessName: string;
  draft: PreviewDraft;
  /** Set once the request has been created — activates the actions. */
  created: PaymentRequest | null;
}

function useCountdown(expiresAt: string | null): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setLabel(null);
      return;
    }
    const tick = () => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      if (ms <= 0) {
        setLabel("00:00:00");
        return;
      }
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      setLabel(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return label;
}

/** Live preview of what the customer will see when they scan or open the link. */
export function RequestPreview({ businessName, draft, created }: RequestPreviewProps) {
  const t = useTranslations("bizRequests.preview");
  const countdown = useCountdown(created?.expiresAt ?? null);

  const qrSeed = created?.id ?? (draft.bookingRef || "TP-PREVIEW");
  const paymentLink = created ? `https://pay.trippay.example/r/${created.id}` : null;

  async function copyLink() {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  function downloadQr() {
    const svg = document.getElementById("request-preview-qr")?.querySelector("svg")?.outerHTML;
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trippay-qr-${draft.bookingRef || "request"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {t("title")}
      </p>
      <div className="mt-2 overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* Black header with the diagonal brand motif */}
        <div className="relative flex items-center justify-between overflow-hidden bg-ink px-4 py-3">
          <span className="font-heading font-bold text-white select-none">
            Trip<span className="text-brand">Pay</span>
          </span>
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-28 bg-brand"
            style={{ clipPath: "polygon(35% 0, 100% 0, 100% 100%, 0 100%)" }}
          />
          <span className="relative z-10 font-heading text-xs font-semibold tracking-widest text-white uppercase">
            {t("scanToPay")}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 p-5 text-center">
          <div id="request-preview-qr" className="contents">
            <QrSvg code={qrSeed} label={businessName} className="size-44" />
          </div>
          <p className="flex items-center gap-1.5 font-heading font-bold">
            {businessName}
            <BadgeCheck className="size-4 text-success" aria-hidden="true" />
          </p>
          {draft.customerTotal ? (
            <MoneyAmount
              money={draft.customerTotal}
              className="font-heading text-3xl font-extrabold"
            />
          ) : (
            <p className="font-heading text-3xl font-extrabold text-muted-foreground">—</p>
          )}
          <p className="text-sm text-muted-foreground">
            {draft.bookingRef ? t("booking", { ref: draft.bookingRef }) : t("noBooking")}
            {draft.description ? ` · ${draft.description}` : ""}
          </p>
          <p className="text-xs font-medium text-pending">
            {created && countdown
              ? t("expiresIn", { time: countdown })
              : t("expiresAfter", { duration: draft.expiryLabel })}
          </p>

          <div className="mt-3 w-full space-y-2">
            <Button type="button" className="w-full" disabled={!created} onClick={copyLink}>
              <Link2 data-icon="inline-start" aria-hidden="true" />
              {t("copyLink")}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" disabled={!created} onClick={downloadQr}>
                <Download data-icon="inline-start" aria-hidden="true" />
                {t("downloadQr")}
              </Button>
              <Button
                type="button"
                className="bg-ink text-white hover:bg-ink/85"
                disabled={!created || !created.customerContact}
                onClick={() =>
                  toast.success(t("sent", { contact: created?.customerContact ?? "" }))
                }
              >
                <Send data-icon="inline-start" aria-hidden="true" />
                {t("send")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {created
                ? created.customerContact
                  ? t("liveNote")
                  : t("needContact")
                : t("createFirst")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
