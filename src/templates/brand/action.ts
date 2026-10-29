"use server";

import { z } from "zod";
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { LOOKUP_TAGS } from "@/lib/lookups";
import { User } from "@/generated/prisma/client";

const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

// --- Helpers ---
async function checkAdminOrManager() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!user || user.role === "CUSTOMER") {
    throw new Error("Unauthorized");
  }
}

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

// --- CRUD Actions ---

export async function createBrand(data: BrandFormValues) {
  try {
    await checkAdminOrManager();

    const validation = brandSchema.safeParse(data);
    if (!validation.success) return { success: false, error: "Invalid data" };

    await prisma.brand.create({
      data: {
        name: validation.data.name,
        country: validation.data.country,
      },
    });

    revalidatePath("/admin/brands");
    updateTag(LOOKUP_TAGS.brands);
    return { success: true, message: "Brand created" };
  } catch (error) {
    return { success: false, error: "Failed to create brand" };
  }
}

export async function updateBrand(id: string, data: BrandFormValues) {
  try {
    await checkAdminOrManager();

    const validation = brandSchema.safeParse(data);
    if (!validation.success) return { success: false, error: "Invalid data" };

    await prisma.brand.update({
      where: { id },
      data: {
        name: validation.data.name,
        country: validation.data.country,
      },
    });

    revalidatePath("/admin/brands");
    updateTag(LOOKUP_TAGS.brands);
    return { success: true, message: "Brand updated" };
  } catch (error) {
    return { success: false, error: "Failed to update brand" };
  }
}

export async function deleteBrand(id: string) {
  try {
    await checkAdmin();

    // Prevent deletion if products exist
    const productCount = await prisma.product.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete brand. It has ${productCount} associated products.`,
      };
    }

    await prisma.brand.delete({ where: { id } });

    revalidatePath("/admin/brands");
    updateTag(LOOKUP_TAGS.brands);
    return { success: true, message: "Brand deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete brand" };
  }
}
