import { unstable_cache } from "next/cache";
import { prisma } from "@/config/auth";

export const LOOKUP_TAGS = {
  brands: "lookups-brands",
  categories: "lookups-categories",
  scents: "lookups-scents",
  notes: "lookups-notes",
} as const;

/** Reference data changes rarely — cache across navigations in production. */
const LOOKUP_REVALIDATE_SECONDS = 300;

export const getBrandOptions = unstable_cache(
  async () => prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ["lookups-brands"],
  { revalidate: LOOKUP_REVALIDATE_SECONDS, tags: [LOOKUP_TAGS.brands] },
);

export const getCategoryOptions = unstable_cache(
  async () =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        parentCategory: { select: { id: true, name: true } },
      },
    }),
  ["lookups-categories"],
  { revalidate: LOOKUP_REVALIDATE_SECONDS, tags: [LOOKUP_TAGS.categories] },
);

export const getScentOptions = unstable_cache(
  async () => prisma.scent.findMany({ orderBy: { title: "asc" } }),
  ["lookups-scents"],
  { revalidate: LOOKUP_REVALIDATE_SECONDS, tags: [LOOKUP_TAGS.scents] },
);

export const getNoteOptions = unstable_cache(
  async () => prisma.note.findMany({ orderBy: { title: "asc" } }),
  ["lookups-notes"],
  { revalidate: LOOKUP_REVALIDATE_SECONDS, tags: [LOOKUP_TAGS.notes] },
);
