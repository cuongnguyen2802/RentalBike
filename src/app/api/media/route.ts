import { NextRequest, NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const IMAGE_EXTS  = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

export async function GET() {
  if (!existsSync(UPLOAD_DIR)) return NextResponse.json({ files: [] });
  try {
    const names = (await readdir(UPLOAD_DIR)).filter((n) => n !== ".gitkeep");
    const files = await Promise.all(
      names.map(async (filename) => {
        const s    = await stat(join(UPLOAD_DIR, filename));
        const ext  = filename.slice(filename.lastIndexOf(".")).toLowerCase();
        return {
          filename,
          url:     `/uploads/${filename}`,
          size:    s.size,
          mtime:   s.mtime.toISOString(),
          isImage: IMAGE_EXTS.has(ext),
        };
      })
    );
    return NextResponse.json({
      files: files.sort((a, b) => b.mtime.localeCompare(a.mtime)),
    });
  } catch {
    return NextResponse.json({ files: [] });
  }
}

export async function DELETE(req: NextRequest) {
  const { filename } = (await req.json()) as { filename: string };
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  try {
    await unlink(join(UPLOAD_DIR, filename));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
