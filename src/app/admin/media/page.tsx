import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import MediaLibraryClient from "./MediaLibraryClient";

export const metadata: Metadata = { title: "Media Library — Admin" };

export default async function AdminMediaPage() {
  await requireAdmin();

  return (
    <div className="p-8">
      <MediaLibraryClient />
    </div>
  );
}
