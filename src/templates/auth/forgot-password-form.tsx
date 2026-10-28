"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgetPassword } from "@/config/auth-client";

const forgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email().nonempty(t("form.validation.email")),
  });

type ForgotPasswordValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await forgetPassword({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(t("page.auth.forgotError"));
        return;
      }

      toast.success(t("page.auth.forgotSuccess"));
    } catch {
      toast.error(t("page.auth.forgotError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{t("form.label.email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          placeholder={t("form.placeholder.email")}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("page.auth.forgotSending")}
          </>
        ) : (
          t("page.auth.forgotButton")
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
