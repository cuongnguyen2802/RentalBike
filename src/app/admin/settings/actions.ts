"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function saveSetting(
  key: string,
  value: unknown,
): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.siteSetting.upsert({
      where:  { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { error: "Failed to save settings." };
  }
}
