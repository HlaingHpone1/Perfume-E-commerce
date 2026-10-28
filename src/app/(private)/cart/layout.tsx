import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Cart - FragranceHub",
  description: "Review your cart and complete your order.",
};

export default function CartLayout({
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
