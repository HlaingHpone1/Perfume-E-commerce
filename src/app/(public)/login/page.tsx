import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/templates/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - FragranceHub",
  description: "Sign in to your FragranceHub account",
};

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8 border border-[var(--border)] bg-[var(--card)] p-8 sm:p-10">
        <div>
          <h2 className="font-display text-foreground text-center text-3xl tracking-tight">
            {t("page.auth.loginTitle")}
          </h2>
          <p className="text-muted-foreground mt-3 text-center text-sm">
            {t("page.auth.loginSubtitle")}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
