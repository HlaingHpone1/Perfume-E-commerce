import { CartView } from "@/components/cart-view";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shopping Cart - FragranceHub",
  description: "Review your items and checkout",
};

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
        <nav className="text-muted-foreground mb-10 flex items-center gap-2 text-xs tracking-wide">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Cart</span>
        </nav>

        <CartView />
      </div>
    </div>
  );
}
