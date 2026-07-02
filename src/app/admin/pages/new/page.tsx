import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import PageBuilder from "../builder/PageBuilder";

export const metadata: Metadata = { title: "New Page — Admin" };

export default async function NewPagePage() {
  await requireAdmin();

  return <PageBuilder mode="add" />;
}
