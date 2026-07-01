"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const RoleSchema = z.enum(["CUSTOMER", "STAFF", "ADMIN"]);

/* ── Change role ─────────────────────────────────────────────── */

export async function changeRole(userId: string, role: string): Promise<{ success: true } | { error: string }> {
  const parsed = RoleSchema.safeParse(role);
  if (!parsed.success) return { error: "Invalid role." };
  try {
    await prisma.user.update({ where: { id: userId }, data: { role: parsed.data } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to update role." };
  }
}

/* ── Create user ─────────────────────────────────────────────── */

const CreateSchema = z.object({
  name:  z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(30).optional(),
  role:  RoleSchema,
});

export async function createUser(data: unknown): Promise<
  | { success: true; user: { id: string; name: string; email: string; phone: string | null; role: string; createdAt: string; bookingCount: number } }
  | { error: string }
> {
  const p = CreateSchema.safeParse(data);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid data." };

  const existing = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (existing) return { error: "A user with this email already exists." };

  let supabaseId = `admin-created-${crypto.randomUUID()}`;

  if (supabaseAdmin) {
    const { data: sb, error } = await supabaseAdmin.auth.admin.createUser({
      email:          p.data.email,
      email_confirm:  true,
      user_metadata:  { name: p.data.name },
    });
    if (error) return { error: `Auth error: ${error.message}` };
    supabaseId = sb.user.id;
  }

  try {
    const user = await prisma.user.create({
      data: {
        name:       p.data.name,
        email:      p.data.email,
        phone:      p.data.phone || null,
        role:       p.data.role,
        supabaseId,
      },
    });
    revalidatePath("/admin/users");
    return {
      success: true,
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        phone:        user.phone ?? null,
        role:         user.role,
        createdAt:    user.createdAt.toISOString(),
        bookingCount: 0,
      },
    };
  } catch {
    return { error: "Failed to create user." };
  }
}

/* ── Update user ─────────────────────────────────────────────── */

const UpdateSchema = z.object({
  name:  z.string().min(1, "Name is required").max(100),
  phone: z.string().max(30).optional().or(z.literal("")),
  role:  RoleSchema,
});

export async function updateUser(id: string, data: unknown): Promise<{ success: true } | { error: string }> {
  const p = UpdateSchema.safeParse(data);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid data." };
  try {
    await prisma.user.update({
      where: { id },
      data:  { name: p.data.name, phone: p.data.phone || null, role: p.data.role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to update user." };
  }
}

/* ── Delete user ─────────────────────────────────────────────── */

export async function deleteUser(userId: string): Promise<{ success: true } | { error: string }> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { supabaseId: true } });
    await prisma.user.delete({ where: { id: userId } });
    if (supabaseAdmin && user?.supabaseId && !user.supabaseId.startsWith("admin-created-") && !user.supabaseId.startsWith("dev@")) {
      await supabaseAdmin.auth.admin.deleteUser(user.supabaseId).catch(() => {});
    }
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Cannot delete user — they may have active bookings." };
  }
}

export async function deleteManyUsers(ids: string[]): Promise<{ success: true; count: number } | { error: string }> {
  if (!ids.length) return { error: "No users selected." };
  try {
    const { count } = await prisma.user.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/admin/users");
    return { success: true, count };
  } catch {
    return { error: "Some users could not be deleted (may have bookings)." };
  }
}
