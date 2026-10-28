"use server";

import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { User, Concentration } from "@/generated/prisma/client";
import { VariantFormValues } from "@/templates/product-variants/VariantModal";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createVariant(data: VariantFormValues) {
  try {
    await checkAdmin();

    const {
      productId,
      sku,
      name,
      volumeMl,
      price,
      reorderPoint,
      isTester,
      concentration,
      weightGrams,
    } = data;

    await prisma.productVariant.create({
      data: {
        productId,
        sku,
        name,
        concentration: concentration as Concentration,
        volumeMl,
        price,
        reorderPoint,
        isTester,
        weightGrams: weightGrams || null,
        stockLevel: 0,
        specifications: {},
      },
    });

    revalidatePath("/admin/product-variants");
    return { success: true, message: "Variant created" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create variant" };
  }
}

export async function updateVariant(id: string, data: VariantFormValues) {
  try {
    await checkAdmin();

    const {
      sku,
      name,
      concentration,
      volumeMl,
      price,
      reorderPoint,
      isTester,
      weightGrams,
    } = data;

    const existingSku = await prisma.productVariant.findFirst({
      where: { sku, NOT: { id } },
    });
    if (existingSku) return { success: false, error: "SKU already exists" };

    await prisma.productVariant.update({
      where: { id },
      data: {
        sku,
        name,
        concentration: concentration as Concentration,
        volumeMl,
        price,
        reorderPoint,
        isTester,
        weightGrams: weightGrams || null,
      },
    });

    revalidatePath(`/admin/product-variants`);
    return { success: true, message: "Variant updated successfully" };
  } catch (error) {
    return { success: false, error: "Failed to update variant" };
  }
}

export async function deleteVariant(id: string) {
  try {
    await checkAdmin();

    const orderCount = await prisma.orderItem.count({
      where: { variantId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: `Cannot delete: This variant has been ordered ${orderCount} times.`,
      };
    }

    const batchCount = await prisma.inventoryBatch.count({
      where: { variantId: id },
    });

    if (batchCount > 0) {
      return {
        success: false,
        error: `Cannot delete: Inventory batches exist for this variant.`,
      };
    }

    await prisma.productVariant.delete({ where: { id } });

    revalidatePath("/admin/product-variants");
    return { success: true, message: "Variant deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete variant" };
  }
}
