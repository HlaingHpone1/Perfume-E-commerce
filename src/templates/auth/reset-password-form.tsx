"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/config/auth-client";

const resetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      newPassword: z.string().min(8, t("page.auth.resetPasswordMin")),
      confirmPassword: z.string().min(1, t("form.validation.password")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("form.validation.password_match"),
      path: ["confirmPassword"],
    });

type ResetPasswordValues = z.infer<ReturnType<typeof resetPasswordSchema>>;

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema(t)),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (error) {
        toast.error(t("page.auth.resetError"));
        return;
      }

      toast.success(t("page.auth.resetSuccess"));
      router.push("/login");
    } catch {
      toast.error(t("page.auth.resetError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("page.auth.newPassword")}</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            placeholder={t("form.placeholder.password")}
            disabled={isSubmitting}
          />
          {errors.newPassword && (
            <p className="text-destructive text-sm">
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("form.label.confirmPassword")}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            placeholder={t("form.placeholder.confirmPassword")}
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("page.auth.resetSaving")}
          </>
        ) : (
          t("page.auth.resetButton")
        )}
      </Button>

      <div className="text-center text-sm">
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          {t("page.auth.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
