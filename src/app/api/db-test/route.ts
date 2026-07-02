import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.DATABASE_URL ?? "";
  let parsed = "not-set";
  try {
    const u = new URL(raw);
    parsed = `${u.hostname}:${u.port} / db=${u.pathname} / user=${u.username}`;
  } catch {
    parsed = `url-parse-failed: ${raw.slice(0, 40)}`;
  }

  try {
    const count = await prisma.bike.count();
    const stations = await prisma.station.count();
    return NextResponse.json({ ok: true, bikes: count, stations, parsed });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), parsed }, { status: 500 });
  }
}
