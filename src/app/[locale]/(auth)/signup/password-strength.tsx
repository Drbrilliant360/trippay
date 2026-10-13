"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type TipKey = "length" | "uppercase" | "number" | "symbol";

const CHECKS: { key: TipKey; test: (pw: string) => boolean }[] = [
  { key: "length", test: (pw) => pw.length >= 8 },
  { key: "uppercase", test: (pw) => /[A-Z]/.test(pw) },
  { key: "number", test: (pw) => /\d/.test(pw) },
  { key: "symbol", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function score(pw: string): { score: number; tip: TipKey | null } {
  const failed = CHECKS.filter((c) => !c.test(pw));
  return { score: CHECKS.length - failed.length, tip: failed[0]?.key ?? null };
}

const LEVELS = ["weak", "weak", "fair", "good", "strong"] as const;

/** Simple client-side hint only — the backend remains the authority on password rules. */
export function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("auth.signup.password");
  if (!password) return null;

  const { score: s, tip } = score(password);
  const level = LEVELS[s];
  const barColor = s <= 1 ? "bg-failed" : s === 2 ? "bg-pending" : "bg-success";
  const textColor = s <= 1 ? "text-failed" : s === 2 ? "text-pending" : "text-success";

  return (
    <div aria-live="polite">
      <div className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={cn("h-1.5 rounded-full", i < s ? barColor : "bg-border")}
          />
        ))}
      </div>
      <p className={cn("mt-1.5 text-xs font-medium", textColor)}>
        {t("strength", { level: t(`levels.${level}`) })}
        {tip && <> &middot; {t(`tips.${tip}`)}</>}
      </p>
    </div>
  );
}
