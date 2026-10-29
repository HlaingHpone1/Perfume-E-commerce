"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { useSession } from "@/config/auth-client";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import {
  Product,
  Brand,
  ProductVariant,
  Scent,
} from "@/generated/prisma/client";

type ProductNoteDisplay = {
  type: "Top" | "Middle" | "Base";
  title: string;
  imageUrl?: string | null;
};

type ProductWithRelations = Product & {
  brand: Brand;
  scent?: Scent | null;
  variants: ProductVariant[];
};

type AttachmentData = {
  recordId: string;
  fileUrl: string;
  recordType: "Product" | "ProductVariant";
};

function ImageGallery({
  images,
  productName,
}: {
  images: AttachmentData[];
  productName: string;
}) {
  const [activeImage, setActiveImage] = useState<string | null>(
    images[0]?.fileUrl || null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--storefront-mist)]">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-muted-foreground/40 text-sm tracking-[0.2em] uppercase">
              FragranceHub
            </span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={`${img.recordId}-${idx}`}
              onClick={() => setActiveImage(img.fileUrl)}
              className={cn(
                "relative h-20 w-16 flex-shrink-0 overflow-hidden border transition-colors",
                activeImage === img.fileUrl
                  ? "border-[var(--foreground)]"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.fileUrl}
                alt={`${productName} view ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotePyramid({ notes }: { notes: ProductNoteDisplay[] }) {
  const groups: { key: ProductNoteDisplay["type"]; label: string }[] = [
    { key: "Top", label: "Top" },
    { key: "Middle", label: "Heart" },
    { key: "Base", label: "Base" },
  ];

  const hasAny = notes.length > 0;
  if (!hasAny) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {groups.map(({ key, label }) => {
        const items = notes.filter((n) => n.type === key);
        if (!items.length) return null;
        return (
          <div key={key}>
            <p className="text-foreground text-[0.65rem] tracking-[0.18em] uppercase">
              {label}
            </p>
            <ul className="mt-3 space-y-3">
              {items.map((note) => (
                <li
                  key={`${key}-${note.title}`}
                  className="flex items-center gap-3"
                >
                  <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden bg-[var(--storefront-mist)]">
                    {note.imageUrl ? (
                      <Image
                        src={note.imageUrl}
                        alt={note.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : null}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {note.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function ProductView({
  product,
  attachments,
  productNotes = [],
}: {
  product: ProductWithRelations;
  attachments: AttachmentData[];
  productNotes?: ProductNoteDisplay[];
}) {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id,
  );

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  const displayImages = useMemo(() => {
    const globalImages = attachments.filter(
      (a) => a.recordType === "Product" && a.recordId === product.id,
    );
    const variantImages = attachments.filter(
      (a) =>
        a.recordType === "ProductVariant" && a.recordId === selectedVariantId,
    );
    return [...variantImages, ...globalImages];
  }, [attachments, product.id, selectedVariantId]);

  const handleAddToCart = () => {
    if (!session) {
      toast.error("Please log in to add items to your cart");
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }

    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: `${product.name} - ${selectedVariant.name}`,
      price: selectedVariant.price,
      image: displayImages[0]?.fileUrl,
      quantity: 1,
      concentration: selectedVariant.concentration,
      size: `${selectedVariant.volumeMl}ml`,
    });

    toast.success("Added to cart");
  };

  if (!selectedVariant) return <div>Variant not found</div>;

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
      <ImageGallery
        key={selectedVariantId}
        images={displayImages}
        productName={product.name}
      />

      <div className="flex flex-col gap-8 lg:pt-4">
        <div>
          <p className="text-muted-foreground text-[0.7rem] tracking-[0.2em] uppercase">
            {product.brand.name}
          </p>
          <h1 className="font-display text-foreground mt-2 text-4xl tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          {product.scent?.title ? (
            <p className="text-muted-foreground mt-3 text-sm">
              {product.scent.title}
            </p>
          ) : null}
        </div>

        <div className="flex items-baseline gap-4">
          <p className="text-foreground text-2xl tracking-wide">
            ${selectedVariant.price.toFixed(2)}
          </p>
          <p className="text-muted-foreground text-sm">
            {selectedVariant.stockLevel > 0
              ? `${selectedVariant.stockLevel} available`
              : "Out of stock"}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-foreground text-[0.65rem] tracking-[0.18em] uppercase">
            Size
          </p>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "relative flex min-w-[5.5rem] cursor-pointer flex-col items-start border px-4 py-3 text-left text-sm transition-colors outline-none",
                  selectedVariantId === variant.id
                    ? "border-[var(--foreground)] bg-[var(--secondary)]"
                    : "border-[var(--border)] hover:border-[var(--foreground)]/40",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-medium">{variant.volumeMl}ml</span>
                  {selectedVariantId === variant.id && (
                    <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                </div>
                <span className="text-muted-foreground mt-1 text-xs">
                  {variant.concentration}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-[var(--border)]" />

        <Button
          size="lg"
          className="w-full rounded-none text-[0.7rem] tracking-[0.2em] uppercase"
          disabled={selectedVariant.stockLevel <= 0 || isAuthPending}
          onClick={handleAddToCart}
        >
          {isAuthPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShoppingBag className="mr-2 h-4 w-4" strokeWidth={1.5} />
          )}
          {selectedVariant.stockLevel > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>

        <div className="space-y-6 pt-2">
          {product.description ? (
            <div>
              <h3 className="text-foreground mb-3 text-[0.65rem] tracking-[0.18em] uppercase">
                Description
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          ) : null}

          <NotePyramid notes={productNotes} />
        </div>
      </div>
    </div>
  );
}
