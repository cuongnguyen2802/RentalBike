"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MenuSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
});

const ItemSchema = z.object({
  label:  z.string().min(1, "Label is required").max(100),
  url:    z.string().min(1, "URL is required").max(500),
  target: z.enum(["_self", "_blank"]).default("_self"),
});

type MenuResult = { success: true; id: string } | { error: string };
type ItemResult = { success: true; item: { id: string; label: string; url: string; target: string; order: number } } | { error: string };

function isUniqueError(e: unknown) {
  return e instanceof Error && e.message.includes("Unique constraint");
}

export async function createMenu(data: unknown): Promise<MenuResult> {
  const p = MenuSchema.safeParse(data);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid data." };
  try {
    const menu = await prisma.menu.create({ data: p.data });
    revalidatePath("/admin/menus");
    return { success: true, id: menu.id };
  } catch (e) {
    if (isUniqueError(e)) return { error: "A menu with this slug already exists." };
    return { error: "Failed to create menu." };
  }
}

export async function updateMenu(id: string, data: unknown): Promise<MenuResult> {
  const p = MenuSchema.safeParse(data);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid data." };
  try {
    const menu = await prisma.menu.update({ where: { id }, data: p.data });
    revalidatePath("/admin/menus");
    revalidatePath(`/admin/menus/${id}`);
    return { success: true, id: menu.id };
  } catch (e) {
    if (isUniqueError(e)) return { error: "A menu with this slug already exists." };
    return { error: "Failed to update menu." };
  }
}

export async function deleteMenu(id: string): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.menu.delete({ where: { id } });
    revalidatePath("/admin/menus");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete menu." };
  }
}

export async function addMenuItem(menuId: string, data: unknown): Promise<ItemResult> {
  const p = ItemSchema.safeParse(data);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid data." };
  try {
    const count  = await prisma.menuItem.count({ where: { menuId } });
    const item   = await prisma.menuItem.create({
      data: { ...p.data, menuId, order: count },
    });
    revalidatePath("/admin/menus");
    revalidatePath("/");
    return { success: true, item: { id: item.id, label: item.label, url: item.url, target: item.target, order: item.order } };
  } catch {
    return { error: "Failed to add item." };
  }
}

export async function updateMenuItem(id: string, data: unknown): Promise<{ success: true } | { error: string }> {
  const p = ItemSchema.safeParse(data);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid data." };
  try {
    await prisma.menuItem.update({ where: { id }, data: p.data });
    revalidatePath("/admin/menus");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to update item." };
  }
}

export async function deleteMenuItem(id: string): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.menuItem.delete({ where: { id } });
    revalidatePath("/admin/menus");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete item." };
  }
}

export async function reorderMenuItems(
  menuId: string,
  orderedIds: string[],
): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.menuItem.update({ where: { id }, data: { order: index } }),
      ),
    );
    revalidatePath("/admin/menus");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to save order." };
  }
}
