"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Tags,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  PackageOpen,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/config/auth-client";

const sidebarItems = [
  {
    group: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Catalog",
    items: [
      {
        title: "Products",
        href: "/admin/products",
        icon: ShoppingBag,
      },
      {
        title: "Product Variants",
        href: "/admin/product-variants",
        icon: ShoppingBag,
      },
      {
        title: "Inventory",
        href: "/admin/inventory",
        icon: PackageOpen, // Good for stock/variants specific view
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: Layers,
      },
      {
        title: "Brands",
        href: "/admin/brands",
        icon: Tags,
      },
      {
        title: "Scents",
        href: "/admin/scents",
        icon: Tags,
      },
      {
        title: "Notes",
        href: "/admin/notes",
        icon: Layers,
      },
    ],
  },
  {
    group: "Sales",
    items: [
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    group: "System",
    items: [
      {
        title: "Contact Messages",
        href: "/admin/contact-messages",
        icon: Mail,
      },
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: FileText,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white text-sm">
      {/* Header / Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/admin/dashboard"
          className="text-primary flex items-center gap-2 text-xl font-bold"
        >
          <span>🌸</span> Admin
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6 px-4">
          {sidebarItems.map((group) => (
            <div key={group.group}>
              <h3 className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
