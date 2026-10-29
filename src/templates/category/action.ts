"use server";

import { z } from "zod";
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { LOOKUP_TAGS } from "@/lib/lookups";
import { User } from "@/generated/prisma/client";

// --- Schema ---
// Slug regex: allows lowercase letters, numbers, and hyphens
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  parentCategoryId: z.string().optional().nullable(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// --- Helper: Auth Check ---
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

// --- Actions ---

export async function createCategory(data: CategoryFormValues) {
  try {
    await checkAdminOrManager();
    const validation = categorySchema.safeParse(data);
    if (!validation.success) return { success: false, error: "Invalid data" };

    const { name, slug, parentCategoryId } = validation.data;

    // Check slug uniqueness
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) return { success: false, error: "Slug already exists" };

    await prisma.category.create({
      data: {
        name,
        slug,
        parentCategoryId: parentCategoryId || null, // Ensure explicit null if empty
      },
    });

    revalidatePath("/admin/categories");
    updateTag(LOOKUP_TAGS.categories);
    updateTag("catalog-categories");
    return { success: true, message: "Category created successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: CategoryFormValues) {
  try {
    await checkAdminOrManager();
    const validation = categorySchema.safeParse(data);
    if (!validation.success) return { success: false, error: "Invalid data" };

    const { name, slug, parentCategoryId } = validation.data;

    // Prevent category from being its own parent
    if (parentCategoryId === id) {
      return { success: false, error: "A category cannot be its own parent" };
    }

    // Check slug uniqueness (exclude current category)
    const existingSlug = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existingSlug) return { success: false, error: "Slug already exists" };

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentCategoryId: parentCategoryId || null,
      },
    });

    revalidatePath("/admin/categories");
    updateTag(LOOKUP_TAGS.categories);
    updateTag("catalog-categories");
    return { success: true, message: "Category updated successfully" };
  } catch (error) {
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await checkAdmin();

    // 1. Check for Subcategories
    const subCount = await prisma.category.count({
      where: { parentCategoryId: id },
    });
    if (subCount > 0) {
      return {
        success: false,
        error: `Cannot delete: This category has ${subCount} subcategories. Please move or delete them first.`,
      };
    }

    // 2. Check for Products
    const prodCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (prodCount > 0) {
      return {
        success: false,
        error: `Cannot delete: This category contains ${prodCount} products.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    updateTag(LOOKUP_TAGS.categories);
    updateTag("catalog-categories");
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}
