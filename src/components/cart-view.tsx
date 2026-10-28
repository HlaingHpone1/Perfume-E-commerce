"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useSession } from "@/config/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Loader2,
  CreditCard,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { placeOrder } from "@/templates/order/action";
import { cn } from "@/utils";

const shippingSchema = z.object({
  recipientName: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Zip Code is required"),
  country: z.string().min(2, "Country is required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export function CartView() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const { items, removeItem, updateQuantity, clearCart, getCartCount } =
    useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Stripe">("COD");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = subtotal > 150 ? 0 : 15.0;
  const total = subtotal + shippingCost;

  async function onSubmit(data: ShippingFormValues) {
    if (!session) {
      toast.error("Please log in to place an order");
      router.push("/login?callbackUrl=/cart");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderInput = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: data,
        paymentGateway: paymentMethod,
        transactionId:
          paymentMethod === "Stripe" ? `simulated_tx_${Date.now()}` : undefined,
      };

      // @ts-ignore - Ignoring strict type check on client for the enum match
      const result = await placeOrder(orderInput);

      if (result.success) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/orders/${result.orderId}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Critical error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
        <ShoppingBag
          className="text-muted-foreground mb-6 h-10 w-10"
          strokeWidth={1.25}
        />
        <h2 className="font-display text-foreground text-3xl tracking-tight">
          Your cart is empty
        </h2>
        <Button
          asChild
          size="lg"
          className="mt-8 rounded-none px-8 text-[0.7rem] tracking-[0.2em] uppercase"
        >
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="flex items-end justify-between border-b border-[var(--border)] pb-5">
          <h2 className="font-display text-foreground text-3xl tracking-tight">
            Shopping Cart
          </h2>
          <span className="text-muted-foreground text-sm">
            {getCartCount()} items
          </span>
        </div>

        <div className="mt-8 space-y-8">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 border-b border-[var(--border)] pb-8 sm:gap-6"
            >
              <div className="relative aspect-[3/4] h-28 w-20 flex-shrink-0 overflow-hidden bg-[var(--storefront-mist)] sm:h-32 sm:w-24">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-muted-foreground/40 text-[0.55rem] tracking-[0.15em] uppercase">
                      FH
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-display text-foreground text-lg leading-snug">
                      <Link
                        href={`/products/${item.productId}`}
                        className="hover:opacity-70"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs tracking-wide">
                      <span>{item.size}</span>
                      <span>·</span>
                      <span>{item.concentration}</span>
                    </div>
                  </div>
                  <p className="text-foreground text-sm font-medium whitespace-nowrap">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 border border-[var(--border)] px-2 py-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="p-1 opacity-70 hover:opacity-100 disabled:opacity-30"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="p-1 opacity-70 hover:opacity-100"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs tracking-wide transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <div className="mb-8">
            <h3 className="text-foreground mb-4 text-[0.65rem] tracking-[0.18em] uppercase">
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={cn(
                  "cursor-pointer border p-4 text-left transition-colors",
                  paymentMethod === "COD"
                    ? "border-[var(--foreground)] bg-[var(--secondary)]"
                    : "border-[var(--border)] hover:border-[var(--foreground)]/40",
                )}
              >
                <Banknote className="mb-2 h-5 w-5" strokeWidth={1.5} />
                <div className="text-sm font-medium">Cash on Delivery</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Stripe")}
                className={cn(
                  "cursor-pointer border p-4 text-left transition-colors",
                  paymentMethod === "Stripe"
                    ? "border-[var(--foreground)] bg-[var(--secondary)]"
                    : "border-[var(--border)] hover:border-[var(--foreground)]/40",
                )}
              >
                <CreditCard className="mb-2 h-5 w-5" strokeWidth={1.5} />
                <div className="text-sm font-medium">Credit Card</div>
              </button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="mb-8">
            <h3 className="text-foreground mb-4 text-[0.65rem] tracking-[0.18em] uppercase">
              Shipping Address
            </h3>

            {!session && !isAuthPending ? (
              <div className="border border-dashed border-[var(--border)] p-6 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Please log in to checkout.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-none text-[0.65rem] tracking-[0.18em] uppercase"
                >
                  <Link href="/login?callbackUrl=/cart">Log In</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  id="checkout-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-none"
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-none"
                              placeholder="+1 234..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-none"
                              placeholder="USA"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-none"
                            placeholder="123 Main St"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-none"
                              placeholder="New York"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-none"
                              placeholder="10001"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-none"
                            placeholder="NY"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </div>

          <Separator className="my-6" />

          <h3 className="text-foreground mb-4 text-[0.65rem] tracking-[0.18em] uppercase">
            Order Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            className="mt-8 w-full rounded-none text-[0.7rem] tracking-[0.2em] uppercase"
            size="lg"
            disabled={!session || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay with {paymentMethod === "COD" ? "Cash" : "Card"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
