"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, prisma } from "@/config/auth";
import { User } from "@/generated/prisma/client";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

async function requireUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User | undefined;

  if (!user) {
    return null;
  }

  return user;
}

export async function updateProfile(name: string) {
  const user = await requireUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = profileSchema.safeParse({ name });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid name",
    };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/profile");
    return { success: true, message: "Profile updated" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const user = await requireUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid password",
    };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });

    return { success: true, message: "Password updated" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update password",
    };
  }
}
