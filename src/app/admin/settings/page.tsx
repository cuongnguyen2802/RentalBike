import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllSettings } from "@/lib/settings";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getAllSettings();

  return (
    <div className="p-8">
      <SettingsClient {...settings} />
    </div>
  );
}
