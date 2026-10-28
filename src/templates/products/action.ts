"use server";

import { z } from "zod";
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  User,
  AttachmentRecordType,
  Prisma,
  GenderTarget,
  NoteType,
} from "@/generated/prisma/client";
import {
  deleteFileLocally,
  saveFileLocally,
} from "@/templates/action/fileUpload";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  scentId: z.string().optional().nullable(),
  genderTarget: z.nativeEnum(GenderTarget).optional().nullable(),
});

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

async function checkAdminOrManager() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!user || user.role === "CUSTOMER") {
    throw new Error("Unauthorized");
  }
}

function parseNoteIds(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map(String)
    .filter((id) => id.length > 0);
}

function buildProductNotes(
  productId: string,
  topIds: string[],
  middleIds: string[],
  baseIds: string[],
) {
  const rows: {
    productId: string;
    noteId: string;
    type: NoteType;
    sortOrder: number;
  }[] = [];
  const push = (type: NoteType, ids: string[]) => {
    ids.forEach((noteId, i) => {
      rows.push({ productId, noteId, type, sortOrder: i });
    });
  };
  push(NoteType.Top, topIds);
  push(NoteType.Middle, middleIds);
  push(NoteType.Base, baseIds);
  return rows;
}

export async function createProduct(formData: FormData) {
  try {
    await checkAdminOrManager();

    const genderRaw = formData.get("genderTarget");
    const scentRaw = formData.get("scentId");
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      brandId: formData.get("brandId"),
      categoryId: formData.get("categoryId"),
      scentId: scentRaw && String(scentRaw).length ? String(scentRaw) : null,
      genderTarget:
        genderRaw && String(genderRaw).length ? String(genderRaw) : null,
    };

    const validation = productSchema.safeParse(rawData);
    if (!validation.success) return { success: false, error: "Invalid data" };

    const topNoteIds = parseNoteIds(formData, "topNoteIds");
    const middleNoteIds = parseNoteIds(formData, "middleNoteIds");
    const baseNoteIds = parseNoteIds(formData, "baseNoteIds");

    const file = formData.get("image") as File | null;
    let attachmentData = null;

    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return { success: false, error: "File must be an image" };
      }
      const uploadResult = await saveFileLocally(file, "products");
      attachmentData = uploadResult;
    }

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: validation.data.name,
          description: validation.data.description || "",
          brandId: validation.data.brandId,
          categoryId: validation.data.categoryId,
          scentId: validation.data.scentId || null,
          genderTarget: validation.data.genderTarget || null,
        },
      });

      const noteRows = buildProductNotes(
        product.id,
        topNoteIds,
        middleNoteIds,
        baseNoteIds,
      );
      if (noteRows.length) {
        await tx.productNote.createMany({ data: noteRows });
      }

      if (attachmentData) {
        await tx.attachment.create({
          data: {
            fileUrl: attachmentData.url,
            fileType: attachmentData.type,
            fileSizeKb: attachmentData.size / 1024,
            purpose: "main_image",
            recordType: AttachmentRecordType.Product,
            recordId: product.id,
          },
        });
      }
    });

    revalidatePath("/admin/products");
    return { success: true, message: "Product created" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await checkAdminOrManager();

    const genderRaw = formData.get("genderTarget");
    const scentRaw = formData.get("scentId");
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      brandId: formData.get("brandId"),
      categoryId: formData.get("categoryId"),
      scentId: scentRaw && String(scentRaw).length ? String(scentRaw) : null,
      genderTarget:
        genderRaw && String(genderRaw).length ? String(genderRaw) : null,
    };

    const validation = productSchema.safeParse(rawData);
    if (!validation.success) return { success: false, error: "Invalid data" };

    const topNoteIds = parseNoteIds(formData, "topNoteIds");
    const middleNoteIds = parseNoteIds(formData, "middleNoteIds");
    const baseNoteIds = parseNoteIds(formData, "baseNoteIds");

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: validation.data.name,
          description: validation.data.description || "",
          brandId: validation.data.brandId,
          categoryId: validation.data.categoryId,
          scentId: validation.data.scentId || null,
          genderTarget: validation.data.genderTarget || null,
        },
      });

      await tx.productNote.deleteMany({ where: { productId: id } });
      const noteRows = buildProductNotes(
        id,
        topNoteIds,
        middleNoteIds,
        baseNoteIds,
      );
      if (noteRows.length) {
        await tx.productNote.createMany({ data: noteRows });
      }
    });

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const oldAttachment = await prisma.attachment.findFirst({
        where: { recordId: id, recordType: AttachmentRecordType.Product },
      });

      if (oldAttachment) {
        await deleteFileLocally(oldAttachment.fileUrl);
        await prisma.attachment.delete({ where: { id: oldAttachment.id } });
      }

      const uploadResult = await saveFileLocally(file, "products");

      await prisma.attachment.create({
        data: {
          fileUrl: uploadResult.url,
          fileType: uploadResult.type,
          fileSizeKb: uploadResult.size / 1024,
          purpose: "main_image",
          recordType: AttachmentRecordType.Product,
          recordId: id,
        },
      });
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product updated" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await checkAdmin();

    const variantCount = await prisma.productVariant.count({
      where: { productId: id },
    });

    if (variantCount > 0) {
      return {
        success: false,
        error: `Cannot delete: This product has ${variantCount} variants. Please delete them first.`,
      };
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });

    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      const orderCount = await prisma.orderItem.count({
        where: {
          variantId: { in: variantIds },
        },
      });

      if (orderCount > 0) {
        return {
          success: false,
          error: `Cannot delete: This product has been ordered ${orderCount} times. Archive it instead.`,
        };
      }
    }

    const attachments = await prisma.attachment.findMany({
      where: { recordId: id, recordType: AttachmentRecordType.Product },
    });

    for (const att of attachments) {
      await deleteFileLocally(att.fileUrl);
    }

    await prisma.attachment.deleteMany({
      where: { recordId: id, recordType: AttachmentRecordType.Product },
    });

    await prisma.productNote.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Delete product error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return {
          success: false,
          error: "Cannot delete: Related records exist.",
        };
      }
    }
    return { success: false, error: "Failed to delete product" };
  }
}
