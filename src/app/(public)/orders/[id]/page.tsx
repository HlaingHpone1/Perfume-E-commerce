import { auth } from "@/config/auth";
import { prisma } from "@/config/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AttachmentRecordType } from "@/generated/prisma/client";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Order #${id} - FragranceHub` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/login?callbackUrl=/orders/${id}`);
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      shippingAddress: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { brand: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const variantIds = order.items.map((i) => i.variantId);
  const productIds = order.items.map((i) => i.variant.productId);

  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: {
        in: [AttachmentRecordType.Product, AttachmentRecordType.ProductVariant],
      },
      recordId: { in: [...variantIds, ...productIds] },
    },
  });

  const itemsSubtotal = order.items.reduce(
    (acc, i) => acc + i.unitPrice * i.quantity,
    0,
  );

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/orders"
              className="text-muted-foreground hover:text-foreground text-xs tracking-[0.16em] uppercase transition-colors"
            >
              ← Back to orders
            </Link>
            <h1 className="font-display text-foreground mt-3 text-3xl tracking-tight md:text-4xl">
              Order {order.orderCode}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Placed on {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="border border-[var(--border)] bg-[var(--card)]">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-foreground text-[0.65rem] tracking-[0.18em] uppercase">
                  Order Items
                </h2>
              </div>
              <div className="divide-y divide-[var(--border)] px-6">
                {order.items.map((item) => {
                  const img =
                    attachments.find((a) => a.recordId === item.variantId) ||
                    attachments.find(
                      (a) => a.recordId === item.variant.productId,
                    );

                  return (
                    <div key={item.id} className="flex gap-4 py-5">
                      <div className="relative h-24 w-[4.5rem] flex-shrink-0 overflow-hidden bg-[var(--storefront-mist)]">
                        {img ? (
                          <Image
                            src={img.fileUrl}
                            alt={item.variant.product.name}
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
                        <div>
                          <h3 className="font-display text-foreground text-lg leading-snug">
                            {item.variant.product.name}
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {item.variant.name} ({item.variant.volumeMl}ml)
                          </p>
                          <p className="text-muted-foreground text-xs tracking-wide uppercase">
                            {item.variant.product.brand.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${item.unitPrice.toFixed(2)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-[var(--border)] bg-[var(--card)] p-6">
              <h3 className="text-foreground mb-4 text-[0.65rem] tracking-[0.18em] uppercase">
                Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.totalAmount > 150
                      ? "Free"
                      : `$${(order.totalAmount - itemsSubtotal).toFixed(2)}`}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="border border-[var(--border)] bg-[var(--card)] p-6">
                <h3 className="text-foreground mb-4 text-[0.65rem] tracking-[0.18em] uppercase">
                  Shipping
                </h3>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p className="text-foreground font-medium">
                    {order.shippingAddress.recipientName}
                  </p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-4 text-xs tracking-wide">
                    Tracking: {order.trackingNumber || "Pending"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Placed: "bg-[var(--secondary)] text-foreground border-[var(--border)]",
    Processing: "bg-[var(--secondary)] text-foreground border-[var(--border)]",
    Shipped: "bg-[var(--secondary)] text-foreground border-[var(--border)]",
    Delivered:
      "bg-[var(--secondary)] text-[var(--primary)] border-[var(--border)]",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge
      className={`rounded-none px-3 py-1 font-normal ${styles[status] || "text-foreground bg-[var(--secondary)]"}`}
      variant="outline"
    >
      {status}
    </Badge>
  );
}
