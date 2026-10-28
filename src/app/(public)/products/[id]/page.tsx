import { notFound } from "next/navigation";
import { prisma } from "@/config/auth";
import { ProductView } from "@/components/product-view";
import { ProductCard } from "@/components/product-card";
import { AttachmentRecordType } from "@/generated/prisma/client";
import Link from "next/link";
import { resolvePublicImage } from "@/utils/resolve-public-image";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} by ${product.brand.name} - FragranceHub`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      scent: true,
      productNotes: {
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
        include: { note: true },
      },
      variants: {
        orderBy: { price: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: {
      brand: true,
      scent: true,
      variants: {
        take: 1,
        orderBy: { price: "asc" },
      },
    },
  });

  const noteIds = product.productNotes.map((pn) => pn.noteId);
  const relatedProductIds = relatedProducts.map((p) => p.id);
  const allRelevantIds = [
    product.id,
    ...product.variants.map((v) => v.id),
    ...relatedProductIds,
  ];

  const [attachments, noteAttachments] = await Promise.all([
    prisma.attachment.findMany({
      where: {
        recordType: {
          in: [
            AttachmentRecordType.Product,
            AttachmentRecordType.ProductVariant,
          ],
        },
        recordId: { in: allRelevantIds },
      },
      select: {
        recordId: true,
        fileUrl: true,
        recordType: true,
      },
    }),
    noteIds.length
      ? prisma.attachment.findMany({
          where: {
            recordType: AttachmentRecordType.Note,
            recordId: { in: noteIds },
          },
          select: { recordId: true, fileUrl: true },
        })
      : Promise.resolve([]),
  ]);

  const noteImageById = Object.fromEntries(
    noteAttachments.flatMap((a) => {
      const fileUrl = resolvePublicImage(a.fileUrl);
      return fileUrl ? [[a.recordId, fileUrl] as const] : [];
    }),
  );

  const productNotes = product.productNotes.map((pn) => ({
    type: pn.type as "Top" | "Middle" | "Base",
    title: pn.note.title,
    imageUrl: noteImageById[pn.noteId] ?? null,
  }));

  const mainProductAttachments = attachments
    .filter(
      (a) =>
        a.recordId === product.id ||
        product.variants.some((v) => v.id === a.recordId),
    )
    .flatMap((a) => {
      const fileUrl = resolvePublicImage(a.fileUrl);
      if (!fileUrl) return [];
      return [
        {
          ...a,
          fileUrl,
          recordType: a.recordType as "Product" | "ProductVariant",
        },
      ];
    });

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
        <nav className="text-muted-foreground mb-10 flex flex-wrap items-center gap-2 text-xs tracking-wide">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-foreground transition-colors"
          >
            Collection
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <ProductView
          product={product}
          attachments={mainProductAttachments}
          productNotes={productNotes}
        />

        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-[var(--border)] pt-16">
            <h2 className="font-display text-foreground mb-10 text-3xl tracking-tight">
              You Might Also Like
            </h2>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => {
                const variant = related.variants[0];
                const image = attachments.find(
                  (a) =>
                    a.recordType === AttachmentRecordType.Product &&
                    a.recordId === related.id,
                );

                return (
                  <ProductCard
                    key={related.id}
                    id={related.id}
                    name={related.name}
                    brandName={related.brand.name}
                    imageUrl={resolvePublicImage(image?.fileUrl)}
                    price={variant?.price}
                    scent={related.scent?.title}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
