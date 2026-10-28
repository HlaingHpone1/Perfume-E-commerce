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

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

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

export async function createNote(formData: FormData) {
  try {
    await checkAdminOrManager();

    const validation = noteSchema.safeParse({
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
      attachmentData = await saveFileLocally(file, "notes");
    }

    await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: { title: validation.data.title },
      });
      if (attachmentData) {
        await tx.attachment.create({
          data: {
            fileUrl: attachmentData.url,
            fileType: attachmentData.type,
            fileSizeKb: attachmentData.size / 1024,
            purpose: "main_image",
            recordType: AttachmentRecordType.Note,
            recordId: note.id,
          },
        });
      }
    });

    revalidatePath("/admin/notes");
    return { success: true, message: "Note created" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create note" };
  }
}

export async function updateNote(id: string, formData: FormData) {
  try {
    await checkAdminOrManager();

    const validation = noteSchema.safeParse({
      title: formData.get("title"),
    });
    if (!validation.success) return { success: false, error: "Invalid data" };

    await prisma.note.update({
      where: { id },
      data: { title: validation.data.title },
    });

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return { success: false, error: "File must be an image" };
      }
      const oldAttachment = await prisma.attachment.findFirst({
        where: { recordId: id, recordType: AttachmentRecordType.Note },
      });
      if (oldAttachment) {
        await deleteFileLocally(oldAttachment.fileUrl);
        await prisma.attachment.delete({ where: { id: oldAttachment.id } });
      }
      const uploadResult = await saveFileLocally(file, "notes");
      await prisma.attachment.create({
        data: {
          fileUrl: uploadResult.url,
          fileType: uploadResult.type,
          fileSizeKb: uploadResult.size / 1024,
          purpose: "main_image",
          recordType: AttachmentRecordType.Note,
          recordId: id,
        },
      });
    }

    revalidatePath("/admin/notes");
    return { success: true, message: "Note updated" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update note" };
  }
}

export async function deleteNote(id: string) {
  try {
    await checkAdmin();

    const usageCount = await prisma.productNote.count({
      where: { noteId: id },
    });
    if (usageCount > 0) {
      return {
        success: false,
        error: `Cannot delete note. It is used on ${usageCount} product note links.`,
      };
    }

    const attachments = await prisma.attachment.findMany({
      where: { recordId: id, recordType: AttachmentRecordType.Note },
    });
    for (const att of attachments) {
      await deleteFileLocally(att.fileUrl);
    }
    await prisma.attachment.deleteMany({
      where: { recordId: id, recordType: AttachmentRecordType.Note },
    });
    await prisma.note.delete({ where: { id } });

    revalidatePath("/admin/notes");
    return { success: true, message: "Note deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete note" };
  }
}
