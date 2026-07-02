import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.bike.count();
    const stations = await prisma.station.count();
    return NextResponse.json({ ok: true, bikes: count, stations });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
