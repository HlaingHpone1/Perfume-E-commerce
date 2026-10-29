import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/sidebar";
import { getSession } from "@/lib/session";
import { User } from "@/generated/prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session && (session.user as User).role === "CUSTOMER") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 md:block">
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
