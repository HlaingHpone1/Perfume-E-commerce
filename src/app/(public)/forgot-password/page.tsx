import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { ForgotPasswordForm } from "@/templates/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password - FragranceHub",
  description: "Request a link to reset your FragranceHub password",
};

export default async function ForgotPasswordPage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8 border border-[var(--border)] bg-[var(--card)] p-8 sm:p-10">
        <div>
          <h2 className="font-display text-foreground text-center text-3xl tracking-tight">
            {t("page.auth.forgotTitle")}
          </h2>
          <p className="text-muted-foreground mt-3 text-center text-sm">
            {t("page.auth.forgotSubtitle")}
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
