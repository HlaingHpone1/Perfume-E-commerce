import { auth } from "@/config/auth";
import { prisma } from "@/config/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";

export const metadata = {
  title: "My Orders - FragranceHub",
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-display text-foreground text-4xl tracking-tight">
            My Orders
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            View and track your past purchases.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <Package
              className="text-muted-foreground mb-5 h-8 w-8"
              strokeWidth={1.25}
            />
            <h3 className="font-display text-foreground text-2xl tracking-tight">
              No orders found
            </h3>
            <p className="text-muted-foreground mt-2 mb-8 text-sm">
              You haven&apos;t placed any orders yet.
            </p>
            <Button
              asChild
              className="rounded-none text-[0.65rem] tracking-[0.18em] uppercase"
            >
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden border border-[var(--border)] bg-[var(--card)]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[0.65rem] tracking-[0.16em] uppercase">
                    Order
                  </TableHead>
                  <TableHead className="text-[0.65rem] tracking-[0.16em] uppercase">
                    Date
                  </TableHead>
                  <TableHead className="text-[0.65rem] tracking-[0.16em] uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-[0.65rem] tracking-[0.16em] uppercase">
                    Items
                  </TableHead>
                  <TableHead className="text-right text-[0.65rem] tracking-[0.16em] uppercase">
                    Total
                  </TableHead>
                  <TableHead className="text-right text-[0.65rem] tracking-[0.16em] uppercase">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderCode}
                    </TableCell>
                    <TableCell>
                      {format(order.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{order._count.items} items</TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-[0.65rem] tracking-[0.14em] uppercase"
                      >
                        <Link href={`/orders/${order.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
      className={`rounded-none font-normal ${styles[status] || "text-foreground bg-[var(--secondary)]"}`}
      variant="outline"
    >
      {status}
    </Badge>
  );
}
