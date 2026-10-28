"use server";

import { z } from "zod";
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { User, AttachmentRecordType } from "@/generated/prisma/client";
import {
  deleteFileLocally,
  saveFileLocally,
} from "@/templates/action/fileUpload";

const scentSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export type ScentFormValues = z.infer<typeof scentSchema>;

async function checkAdminOrManager() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || user.role === "CUSTOMER") throw new Error("Unauthorized");
}

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function createScent(formData: FormData) {
  try {
    await checkAdminOrManager();

    const validation = scentSchema.safeParse({
      title: formData.get("title"),
    });
    if (!validation.success) return { success: false, error: "Invalid data" };

    const file = formData.get("image") as File | null;
    let attachmentData: Awaited<ReturnType<typeof saveFileLocally>> | null =
      null;
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return { success: false, error: "File must be an image" };
      }
      attachmentData = await saveFileLocally(file, "scents");
    }

    await prisma.$transaction(async (tx) => {
      const scent = await tx.scent.create({
        data: { title: validation.data.title },
      });
      if (attachmentData) {
        await tx.attachment.create({
          data: {
            fileUrl: attachmentData.url,
            fileType: attachmentData.type,
            fileSizeKb: attachmentData.size / 1024,
            purpose: "main_image",
            recordType: AttachmentRecordType.Scent,
            recordId: scent.id,
          },
        });
      }
    });

    revalidatePath("/admin/scents");
    return { success: true, message: "Scent created" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create scent" };
  }
}

export async function updateScent(id: string, formData: FormData) {
  try {
    await checkAdminOrManager();

    const validation = scentSchema.safeParse({
      title: formData.get("title"),
    });
    if (!validation.success) return { success: false, error: "Invalid data" };

    await prisma.scent.update({
      where: { id },
      data: { title: validation.data.title },
    });

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return { success: false, error: "File must be an image" };
      }
      const oldAttachment = await prisma.attachment.findFirst({
        where: { recordId: id, recordType: AttachmentRecordType.Scent },
      });
      if (oldAttachment) {
        await deleteFileLocally(oldAttachment.fileUrl);
        await prisma.attachment.delete({ where: { id: oldAttachment.id } });
      }
      const uploadResult = await saveFileLocally(file, "scents");
      await prisma.attachment.create({
        data: {
          fileUrl: uploadResult.url,
          fileType: uploadResult.type,
          fileSizeKb: uploadResult.size / 1024,
          purpose: "main_image",
          recordType: AttachmentRecordType.Scent,
          recordId: id,
        },
      });
    }

    revalidatePath("/admin/scents");
    return { success: true, message: "Scent updated" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update scent" };
  }
}

export async function deleteScent(id: string) {
  try {
    await checkAdmin();

    const productCount = await prisma.product.count({ where: { scentId: id } });
    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete scent. It is used by ${productCount} products.`,
      };
    }

    const attachments = await prisma.attachment.findMany({
      where: { recordId: id, recordType: AttachmentRecordType.Scent },
    });
    for (const att of attachments) {
      await deleteFileLocally(att.fileUrl);
    }
    await prisma.attachment.deleteMany({
      where: { recordId: id, recordType: AttachmentRecordType.Scent },
    });
    await prisma.scent.delete({ where: { id } });

    revalidatePath("/admin/scents");
    return { success: true, message: "Scent deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete scent" };
  }
}
