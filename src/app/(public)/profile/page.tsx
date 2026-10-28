import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { User } from "@/generated/prisma/client";
import { SettingsForm } from "@/templates/settings";

export const metadata = {
  title: "Profile - FragranceHub",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User | undefined;

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-display text-foreground text-4xl tracking-tight">
            Profile
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Update your name and password.
          </p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <SettingsForm
            user={{
              name: user.name,
              email: user.email,
              role: user.role,
            }}
          />
        </div>
      </div>
    </div>
  );
}
