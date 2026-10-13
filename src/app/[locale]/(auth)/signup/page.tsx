"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, Lock } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { signup } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountTypePicker } from "./account-type-picker";
import { PasswordStrength } from "./password-strength";
import { AuthSteps } from "../auth-steps";

const DIAL_CODES = [
  { country: "TZ", code: "+255" },
  { country: "KE", code: "+254" },
  { country: "UG", code: "+256" },
  { country: "RW", code: "+250" },
  { country: "GB", code: "+44" },
  { country: "US", code: "+1" },
] as const;

const schema = z.object({
  accountType: z.enum(["traveller", "business"]),
  name: z.string().min(2),
  email: z.string().email(),
  dialCode: z.string(),
  phone: z.string().regex(/^[0-9][0-9\s]{5,13}$/),
  password: z.string().min(8),
  terms: z.literal(true),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const t = useTranslations("auth.signup");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { accountType: "traveller", dialCode: "+255" },
  });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => router.push("/verify"),
  });

  const accountType = watch("accountType");
  const dialCode = watch("dialCode");
  const password = watch("password") ?? "";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <AuthSteps current={1} />
      <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>

      <form
        onSubmit={handleSubmit((values) =>
          mutation.mutate({
            name: values.name,
            email: values.email,
            phone: `${values.dialCode} ${values.phone}`,
            accountType: values.accountType,
          }),
        )}
        className="mt-8 space-y-6"
        noValidate
      >
        <div className="space-y-2">
          <p className="text-sm leading-none font-medium">{t("howUse")}</p>
          <AccountTypePicker
            value={accountType}
            onChange={(type) => setValue("accountType", type)}
          />
        </div>

        <div className="space-y-5 rounded-2xl border bg-card p-5 sm:p-8">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-xs text-failed">{t("errors.name")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-failed">{t("errors.email")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("phone")}</Label>
            <div className="flex gap-2">
              <Select value={dialCode} onValueChange={(v) => setValue("dialCode", v)}>
                <SelectTrigger className="w-28 shrink-0" aria-label={t("dialCode")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAL_CODES.map(({ country, code }) => (
                    <SelectItem key={code} value={code}>
                      {country} {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="754 123 456"
                autoComplete="tel-national"
                className="flex-1"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </div>
            {errors.phone && <p className="text-xs text-failed">{t("errors.phone")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password.label")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <PasswordStrength password={password} />
            {errors.password && <p className="text-xs text-failed">{t("errors.password")}</p>}
          </div>

          <div>
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 size-4 accent-[var(--brand)]"
                {...register("terms")}
              />
              <Label htmlFor="terms" className="inline text-sm font-normal">
                {t.rich("terms", {
                  terms: (chunks) => (
                    <Link href="/legal" className="font-medium text-brand underline underline-offset-2">
                      {chunks}
                    </Link>
                  ),
                  privacy: (chunks) => (
                    <Link href="/legal" className="font-medium text-brand underline underline-offset-2">
                      {chunks}
                    </Link>
                  ),
                })}
              </Label>
            </div>
            {errors.terms && <p className="mt-1 text-xs text-failed">{t("errors.terms")}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("submit")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-medium text-brand hover:underline">
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </form>

      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4" aria-hidden="true" />
        {t("securityNote")}
      </p>
    </div>
  );
}
