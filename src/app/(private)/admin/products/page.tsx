import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { AttachmentRecordType, Prisma } from "@/generated/prisma/client";
import { ProductTable } from "@/templates/products";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = query
    ? { name: { contains: query, mode: "insensitive" } }
    : {};

  const [totalCount, products, brands, categories, scents, notes] =
    await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          scent: true,
          productNotes: { orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { volumeMl: "asc" } },
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
      }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.scent.findMany({ orderBy: { title: "asc" } }),
      prisma.note.findMany({ orderBy: { title: "asc" } }),
    ]);

  const productIds = products.map((p) => p.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Product,
      recordId: { in: productIds },
    },
  });

  const productsWithImages = products.map((p) => ({
    ...p,
    attachments: attachments.filter((a) => a.recordId === p.id),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage base products catalog.</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProductTable
          data={productsWithImages}
          allBrands={brands}
          allCategories={categories}
          allScents={scents}
          allNotes={notes}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}
