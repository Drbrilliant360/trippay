"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/** "We need one more document" review outcome, with a mock upload. */
export function NeedsInfoBanner({
  caseRef,
  onUploaded,
}: {
  caseRef: string;
  onUploaded?: () => void;
}) {
  const t = useTranslations("auth.verification.needsInfo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState(false);

  if (uploaded) {
    return (
      <div
        role="status"
        className="mt-6 flex items-start gap-2 rounded-2xl bg-success-soft p-4 text-sm font-medium text-success"
      >
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t("uploaded")}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="mt-6 flex flex-col gap-4 rounded-2xl border border-failed/40 bg-card p-5 sm:flex-row sm:items-center sm:p-6"
    >
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-failed-soft"
        aria-hidden="true"
      >
        <AlertTriangle className="size-5 text-failed" />
      </span>
      <div className="flex-1">
        <p className="font-heading font-bold text-failed">{t("title")}</p>
        <p className="mt-1 text-sm">{t("body")}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("questions")}{" "}
          <Link href="/help" className="font-medium text-brand underline underline-offset-2">
            {t("contact")}
          </Link>{" "}
          &middot; {t("caseRef")} <span className="font-medium text-foreground">{caseRef}</span>
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        aria-label={t("upload")}
        onChange={(e) => {
          if (e.target.files?.length) {
            setUploaded(true);
            onUploaded?.();
            toast.success(t("uploadedToast"));
          }
        }}
      />
      <Button type="button" size="lg" onClick={() => fileInputRef.current?.click()}>
        <Upload aria-hidden="true" />
        {t("upload")}
      </Button>
    </div>
  );
}
