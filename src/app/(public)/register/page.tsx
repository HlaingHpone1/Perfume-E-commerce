import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/templates/auth/register-form";
import { Metadata } from "next";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register - FragranceHub",
  description: "Create a new FragranceHub account",
};

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  const t = await getTranslations();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8 border border-[var(--border)] bg-[var(--card)] p-8 sm:p-10">
        <div>
          <h2 className="font-display text-foreground text-center text-3xl tracking-tight">
            {t("page.auth.registerTitle")}
          </h2>
          <p className="text-muted-foreground mt-3 text-center text-sm">
            {t("page.auth.registerSubtitle")}
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
