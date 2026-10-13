"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { verifyOtp } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { AuthSteps } from "../auth-steps";

const OTP_LENGTH = 6;

/**
 * Dedicated OTP input — the only place a code is ever entered.
 * TripPay never asks for PINs or OTPs anywhere else.
 */
export default function VerifyPage() {
  const t = useTranslations("auth.verify");
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [failed, setFailed] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const mutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (result) => {
      if (result.ok) {
        router.push("/verification");
      } else {
        setFailed(true);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      }
    },
  });

  function handleChange(index: number, value: string) {
    const sanitized = value.replace(/\D/g, "");
    const next = [...digits];
    if (sanitized.length >= 3) {
      // Paste or one-time-code autofill: spread the digits across the boxes.
      sanitized
        .slice(0, OTP_LENGTH - index)
        .split("")
        .forEach((ch, offset) => {
          next[index + offset] = ch;
        });
    } else {
      next[index] = sanitized.slice(-1);
    }
    setDigits(next);
    setFailed(false);
    const firstEmpty = next.findIndex((d) => d === "");
    if (sanitized) {
      inputsRef.current[firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty]?.focus();
    }
    if (next.every((d) => d !== "")) {
      mutation.mutate(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div>
        <AuthSteps current={2} />
        <h1 className="mt-3 font-heading text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex justify-between gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={t("digitAria", { position: i + 1 })}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={mutation.isPending}
            className="h-14 w-12 rounded-xl border border-input bg-card text-center font-heading text-xl font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          />
        ))}
      </div>

      {mutation.isPending && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("checking")}
        </p>
      )}

      {failed && (
        <p className="flex items-center gap-2 text-sm font-medium text-failed" role="alert">
          <XCircle className="size-4" aria-hidden="true" />
          {t("invalid")}
        </p>
      )}

      <div className="flex items-start gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>{t("pinNotice")}</p>
      </div>

      <Button type="button" variant="link" className="w-full" disabled={mutation.isPending}>
        {t("resend")}
      </Button>
    </div>
  );
}
