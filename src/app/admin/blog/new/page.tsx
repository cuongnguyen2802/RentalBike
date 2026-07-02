import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import PostFormPage from "../PostFormPage";

export const metadata: Metadata = { title: "New Post — Admin" };

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div className="p-8">
      <PostFormPage mode="add" />
    </div>
  );
}
