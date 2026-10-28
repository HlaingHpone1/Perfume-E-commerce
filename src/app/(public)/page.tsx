import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { prisma } from "@/config/auth";
import { getTranslations } from "next-intl/server";
import { AttachmentRecordType } from "@/generated/prisma/enums";
import { ProductCard } from "@/components/product-card";
import { resolvePublicImage } from "@/utils/resolve-public-image";

export default async function Home() {
  const t = await getTranslations();

  const products = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      category: true,
      scent: true,
      variants: {
        take: 1,
        orderBy: { price: "asc" },
      },
    },
  });

  const productIds = products.map((p) => p.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Product,
      recordId: { in: productIds },
    },
  });

  const productsWithImages = products.map((product) => {
    const mainImage = attachments.find((img) => img.recordId === product.id);
    return {
      ...product,
      imageUrl: resolvePublicImage(mainImage?.fileUrl),
      startingPrice: product.variants[0]?.price || 0,
    };
  });

  const heroProduct =
    productsWithImages.find((p) => p.imageUrl) ?? productsWithImages[0];
  const heroImage =
    heroProduct?.imageUrl ??
    resolvePublicImage("/images/products/sauvage.jpg") ??
    "/images/placeholder.jpeg";

  return (
    <div>
      <section className="relative grid min-h-[calc(100svh-4.25rem)] lg:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-6 py-20 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-lg">
            <h1 className="font-display text-foreground text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              {t("page.home.heroTitleMain")}
            </h1>
            <p className="text-muted-foreground mt-6 max-w-md text-base leading-relaxed md:text-lg">
              {t("page.home.heroSubtitle")}
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                asChild
                className="rounded-none px-8 text-[0.7rem] tracking-[0.2em] uppercase"
              >
                <Link href="/products">{t("cta.shopCollection")}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[48vh] lg:min-h-full">
          <Image
            unoptimized
            src={heroImage}
            alt={heroProduct?.name ?? "FragranceHub collection"}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="from-background absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent lg:hidden" />
        </div>
      </section>

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
              brandName={product.brand.name}
              imageUrl={product.imageUrl}
              price={product.startingPrice}
              scent={product.scent?.title}
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
