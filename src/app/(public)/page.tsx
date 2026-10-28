import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/product-card";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { resolvePublicImage } from "@/utils/resolve-public-image";
import { getFeaturedProducts } from "@/lib/catalog";

export default async function Home() {
  const t = await getTranslations();
  const productsWithImages = await getFeaturedProducts();

  const productSlides: HeroSlide[] = productsWithImages
    .filter((p) => Boolean(p.imageUrl))
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      title: product.name,
      subtitle: [product.brandName, product.scentTitle]
        .filter(Boolean)
        .join(" · "),
      ctaHref: `/products/${product.id}`,
      ctaLabel: t("cta.shopThisScent"),
      imageUrl: product.imageUrl as string,
    }));

  const fallbackImage =
    resolvePublicImage("/images/products/sauvage.png") ??
    "/images/placeholder.jpeg";

  const slides: HeroSlide[] =
    productSlides.length > 0
      ? productSlides
      : [
          {
            id: "fallback",
            title: t("page.home.heroTitleMain"),
            subtitle: t("page.home.heroSubtitle"),
            ctaHref: "/products",
            ctaLabel: t("cta.shopCollection"),
            imageUrl: fallbackImage,
          },
        ];

  return (
    <div>
      <HeroCarousel slides={slides} />

      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-foreground text-3xl tracking-tight md:text-4xl">
              {t("page.home.featuredTitle")}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("page.home.featuredSubtitle")}
            </p>
          </div>
          <Link
            href="/products"
            className="text-foreground text-[0.65rem] tracking-[0.2em] uppercase underline-offset-4 hover:underline"
          >
            {t("cta.viewAllProducts")}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {productsWithImages.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              brandName={product.brandName}
              imageUrl={product.imageUrl}
              price={product.startingPrice}
              scent={product.scentTitle}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-24">
          <div className="max-w-lg">
            <h2 className="font-display text-foreground text-3xl tracking-tight md:text-4xl">
              {t("page.home.ctaTitle")}
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              {t("page.home.ctaSubtitle")}
            </p>
          </div>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="rounded-none border-[var(--foreground)] px-8 text-[0.7rem] tracking-[0.2em] uppercase"
          >
            <Link href="/products">{t("cta.exploreProducts")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
