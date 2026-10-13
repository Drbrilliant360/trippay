"use client";

import { useTranslations } from "next-intl";
import { StepIndicator } from "@/components/shared/step-indicator";

const STEP_KEYS = ["language", "account", "code", "verification"] as const;

/** The onboarding flow's shared step indicator: language → account → code → verification. */
export function AuthSteps({ current, className }: { current: number; className?: string }) {
  const t = useTranslations("auth.steps");
  return (
    <StepIndicator
      steps={STEP_KEYS.map((key) => t(key))}
      current={current}
      ariaLabel={t("aria", { current: current + 1, total: STEP_KEYS.length })}
      className={className}
    />
  );
}
