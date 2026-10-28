import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "FragranceHub",
  description: "Discover luxury fragrances and premium perfumes.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="storefront min-h-screen">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
