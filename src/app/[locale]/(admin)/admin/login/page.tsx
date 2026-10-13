"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { login } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { SkipLink } from "@/components/shared/skip-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/brand/wordmark";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  otp: z.string().regex(/^\d{6}$/),
});

type FormValues = z.infer<typeof schema>;

/** Internal admin login — always paired with MFA. */
export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      login({ identifier: values.email, password: values.password }),
    onSuccess: () => router.push("/admin/overview"),
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-4">
      <SkipLink />
      <main id="main" className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <Wordmark />
          <Badge className="bg-brand text-white">{t("internalBadge")}</Badge>
        </div>
        <h1 className="mt-4 font-heading text-xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="mt-5 space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">{t("email")}</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-failed">{t("errors.email")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">{t("password")}</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-failed">{t("errors.password")}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-otp">{t("otp")}</Label>
            <Input
              id="admin-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-invalid={!!errors.otp}
              {...register("otp")}
            />
            {errors.otp && <p className="text-xs text-failed">{t("errors.otp")}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck data-icon="inline-start" aria-hidden="true" />
            )}
            {t("submit")}
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">{t("accessNote")}</p>
      </main>
    </div>
  );
}
