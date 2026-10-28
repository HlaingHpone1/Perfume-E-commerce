import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { ResetPasswordForm } from "@/templates/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password - FragranceHub",
  description: "Choose a new FragranceHub password",
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const t = await getTranslations();
  const { token } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8 border border-[var(--border)] bg-[var(--card)] p-8 sm:p-10">
        <div>
          <h2 className="font-display text-foreground text-center text-3xl tracking-tight">
            {t("page.auth.resetTitle")}
          </h2>
          <p className="text-muted-foreground mt-3 text-center text-sm">
            {token
              ? t("page.auth.resetSubtitle")
              : t("page.auth.resetMissingToken")}
          </p>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="mt-8 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {t("page.auth.forgotButton")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
