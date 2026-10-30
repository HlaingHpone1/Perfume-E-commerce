"use server";

import { z } from "zod";
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ContactStatus, User } from "@/generated/prisma/client";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required").max(320),
  subject: z.string().min(1, "Subject is required").max(300),
  message: z.string().min(1, "Message is required").max(5000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

async function checkAdminOrManager() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!user || user.role === "CUSTOMER") {
    throw new Error("Unauthorized");
  }
}

export async function submitContactForm(data: ContactFormValues) {
  try {
    const validation = contactSchema.safeParse(data);
    if (!validation.success) {
      return { success: false as const, error: "Invalid form data" };
    }

    await prisma.contactSubmission.create({
      data: {
        name: validation.data.name.trim(),
        email: validation.data.email.trim().toLowerCase(),
        subject: validation.data.subject.trim(),
        message: validation.data.message.trim(),
      },
    });

    revalidatePath("/admin/contact-messages");
    return { success: true as const };
  } catch (error) {
    console.error(error);
    return { success: false as const, error: "Failed to send message" };
  }
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  try {
    await checkAdminOrManager();

    await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/contact-messages");
    return { success: true as const, message: `Marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error(error);
    return { success: false as const, error: "Failed to update status" };
  }
}

export async function deleteContactSubmission(id: string) {
  try {
    await checkAdminOrManager();

    await prisma.contactSubmission.delete({ where: { id } });

    revalidatePath("/admin/contact-messages");
    return { success: true as const, message: "Message deleted" };
  } catch (error) {
    console.error(error);
    return { success: false as const, error: "Failed to delete message" };
  }
}
