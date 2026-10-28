import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "FragranceHub",
  description: "Discover luxury fragrances and premium perfumes.",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, headersList] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    headers(),
  ]);

  const currentPath = headersList.get("x-pathname") || "/";

  if (session && (currentPath === "/login" || currentPath === "/register")) {
    redirect("/");
  }
  return (
    <div className="storefront min-h-screen">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
