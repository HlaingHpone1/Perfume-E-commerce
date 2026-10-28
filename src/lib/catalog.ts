import { unstable_cache } from "next/cache";
import { prisma } from "@/config/auth";
import { AttachmentRecordType } from "@/generated/prisma/client";
import { resolvePublicImage } from "@/utils/resolve-public-image";

const REVALIDATE_SECONDS = 60;

async function fetchFeaturedProducts() {
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
  const attachments =
    productIds.length === 0
      ? []
      : await prisma.attachment.findMany({
          where: {
            recordType: AttachmentRecordType.Product,
            recordId: { in: productIds },
          },
        });

  return products.map((product) => {
    const mainImage = attachments.find((img) => img.recordId === product.id);
    return {
      id: product.id,
      name: product.name,
      brandName: product.brand.name,
      scentTitle: product.scent?.title ?? null,
      imageUrl: resolvePublicImage(mainImage?.fileUrl),
      startingPrice: product.variants[0]?.price || 0,
    };
  });
}

export const getFeaturedProducts = unstable_cache(
  fetchFeaturedProducts,
  ["catalog-featured-products"],
  { revalidate: REVALIDATE_SECONDS, tags: ["catalog-featured"] },
);

async function fetchRootCategories() {
  return prisma.category.findMany({
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
}

export const getRootCategories = unstable_cache(
  fetchRootCategories,
  ["catalog-root-categories"],
  { revalidate: REVALIDATE_SECONDS, tags: ["catalog-categories"] },
);
