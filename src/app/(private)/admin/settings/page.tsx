import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { User } from "@/generated/prisma/client";
import { SettingsForm } from "@/templates/settings";

export const metadata = {
  title: "Settings - Admin",
};

export default async function SettingsPage() {
  const session = await getSession();
  const user = session?.user as User | undefined;

  if (!user) {
    redirect("/login");
  }

  if (user.role === "CUSTOMER") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Update your profile and password.
        </p>
      </div>

      <SettingsForm
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  );
}
