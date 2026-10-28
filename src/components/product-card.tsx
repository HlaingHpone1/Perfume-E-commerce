import Link from "next/link";
import Image from "next/image";

export type ProductCardProps = {
  id: string;
  name: string;
  brandName: string;
  imageUrl?: string | null;
  price?: number | null;
  scentFamily?: string | null;
  inStock?: boolean | null;
};

export function ProductCard({
  id,
  name,
  brandName,
  imageUrl,
  price,
  scentFamily,
  inStock,
}: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--storefront-mist)]">
        {imageUrl ? (
          <Image
            unoptimized
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-muted-foreground/40 text-sm tracking-[0.2em] uppercase">
              FragranceHub
            </span>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-muted-foreground text-[0.7rem] tracking-[0.18em] uppercase">
          {brandName}
        </p>
        <h3 className="font-display text-foreground text-lg leading-snug transition-colors group-hover:text-[var(--primary)]">
          {name}
        </h3>
        {scentFamily ? (
          <p className="text-muted-foreground text-sm">{scentFamily}</p>
        ) : null}
        <div className="flex items-baseline justify-between gap-3 pt-1">
          {typeof price === "number" ? (
            <p className="text-foreground text-sm font-medium tracking-wide">
              ${price.toFixed(2)}
            </p>
          ) : null}
          {inStock === false ? (
            <span className="text-muted-foreground text-xs tracking-wide">
              Out of stock
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
