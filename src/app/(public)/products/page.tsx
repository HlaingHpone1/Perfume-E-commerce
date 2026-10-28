import { prisma } from "@/config/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Prisma, AttachmentRecordType } from "@/generated/prisma/client";
import CustomPagination from "@/components/custom-pagination";
import { ProductCard } from "@/components/product-card";
import { Metadata } from "next";
import { cn } from "@/utils";
import { resolvePublicImage } from "@/utils/resolve-public-image";

export const metadata: Metadata = {
  title: "Products - FragranceHub",
  description: "Browse our collection of luxury fragrances",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const t = await getTranslations();

  const params = await searchParams;
  const { category, search } = params || {};
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = {
      OR: [{ slug: category }, { parentCategory: { slug: category } }],
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
      { scent: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [products, totalCount] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        scent: true,
        variants: {
          take: 1,
          orderBy: { price: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const productIds = products.map((p) => p.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Product,
      recordId: { in: productIds },
    },
  });

  const productsWithImages = products.map((product) => {
    const image = attachments.find((a) => a.recordId === product.id);
    return {
      ...product,
      imageUrl: resolvePublicImage(image?.fileUrl),
    };
  });

  const categories = await prisma.category.findMany({
    where: { parentCategoryId: null },
    include: {
      _count: { select: { products: true } },
      subCategories: {
        include: {
          _count: { select: { products: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="mb-12 max-w-2xl">
          <h1 className="font-display text-foreground text-4xl tracking-tight md:text-5xl">
            {t("page.products.title")}
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            {t("page.products.subtitle")}
          </p>
        </div>

        <div className="mb-12 flex flex-wrap gap-x-1 gap-y-2 border-b border-[var(--border)] pb-4">
          <Link
            href="/products"
            className={cn(
              "px-3 py-2 text-[0.65rem] tracking-[0.18em] uppercase transition-colors",
              !category
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("page.products.filterAll")}
          </Link>
          {categories.map((cat) => {
            const subCategoryCount = cat.subCategories.reduce(
              (acc, sub) => acc + sub._count.products,
              0,
            );
            const totalCatCount = cat._count.products + subCategoryCount;

            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={cn(
                  "px-3 py-2 text-[0.65rem] tracking-[0.18em] uppercase transition-colors",
                  category === cat.slug
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {cat.name}
                <span className="text-muted-foreground ml-1.5">
                  {totalCatCount}
                </span>
              </Link>
            );
          })}
        </div>

        {productsWithImages.length > 0 ? (
          <>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsWithImages.map((product) => {
                const variant = product.variants[0];
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    brandName={product.brand.name}
                    imageUrl={product.imageUrl}
                    price={variant?.price}
                    scent={product.scent?.title}
                    inStock={variant ? variant.stockLevel > 0 : null}
                  />
                );
              })}
            </div>

            <CustomPagination totalPages={totalPages} />
          </>
        ) : (
          <div className="py-24 text-center">
            <h3 className="font-display text-foreground text-2xl tracking-tight">
              {t("page.products.emptyTitle")}
            </h3>
            <p className="text-muted-foreground mt-3 text-sm">
              {t("page.products.emptyDescription")}
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-none text-[0.65rem] tracking-[0.18em] uppercase"
              asChild
            >
              <Link href="/products">{t("cta.viewAllProducts")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
