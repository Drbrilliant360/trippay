"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { login } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => router.push("/verify"),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="mx-auto w-full max-w-sm space-y-5"
      noValidate
    >
      <div>
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="identifier">{t("identifier")}</Label>
        <Input
          id="identifier"
          autoComplete="username"
          aria-invalid={!!errors.identifier}
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="text-xs text-failed">{t("errors.identifier")}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-failed">{t("errors.password")}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {t("submit")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          {t("signupLink")}
        </Link>
      </p>
    </form>
  );
}
