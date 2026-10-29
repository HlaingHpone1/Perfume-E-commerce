import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "FragranceHub",
  description: "Discover luxury fragrances and premium perfumes.",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, headersList] = await Promise.all([getSession(), headers()]);

  if (!session) {
    const currentPath = headersList.get("x-pathname") || "/";

    const encodedPath = encodeURIComponent(currentPath);
    redirect(`/login?callbackUrl=${encodedPath}`);
  }

  return <>{children}</>;
}
