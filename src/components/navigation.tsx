"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, stringToColor } from "@/utils/index";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { LogOut, Package, ShoppingBag, User } from "lucide-react";
import { signOut, useSession } from "@/config/auth-client";
import { useCartStore } from "@/stores/useCartStore";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations("navigation");
  const tCta = useTranslations("cta");

  const { data } = useSession();
  const color = stringToColor(data?.user.email ?? "");
  const cartCount = useCartStore((state) => state.getCartCount());

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
          router.push("/");
        },
      },
    });
  };

  const navItems = [
    { href: "/", label: tNav("home") },
    { href: "/products", label: tNav("products") },
    { href: "/about", label: tNav("about") },
    { href: "/contact", label: tNav("contact") },
  ];

  return (
    <nav className="bg-background/90 sticky top-0 z-50 w-full border-b border-[var(--border)] backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group">
          <span className="font-display text-foreground text-[1.65rem] leading-none tracking-tight transition-opacity group-hover:opacity-70">
            FragranceHub
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[0.7rem] tracking-[0.2em] uppercase transition-colors",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {data ? (
            <>
              <Link
                href="/cart"
                className="text-foreground relative p-2 transition-opacity hover:opacity-70"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage />
                      <AvatarFallback
                        className="rounded-full text-xs"
                        style={{
                          color: color.textColor,
                          backgroundColor: color.bgColor,
                        }}
                      >
                        {data?.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {data.user.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {data.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{tNav("profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>{tNav("orders")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{tNav("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[0.7rem] tracking-[0.16em] uppercase"
            >
              <Link href="/login">{tNav("login")}</Link>
            </Button>
          )}

          <Button
            size="sm"
            asChild
            className="hidden rounded-none px-4 text-[0.65rem] tracking-[0.18em] uppercase sm:inline-flex"
          >
            <Link href="/products">{tCta("shopNow")}</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
