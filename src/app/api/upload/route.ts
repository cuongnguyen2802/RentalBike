import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "application/pdf",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });

    const results = await Promise.all(
      files.map(async (file) => {
        if (!ALLOWED_TYPES.has(file.type)) {
          return { error: `File type not allowed: ${file.type}`, name: file.name };
        }
        if (file.size > MAX_FILE_SIZE) {
          return { error: `File too large (max 10 MB): ${file.name}`, name: file.name };
        }

        const ext      = extname(file.name).toLowerCase() || ".bin";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const bytes    = await file.arrayBuffer();

        await writeFile(join(UPLOAD_DIR, safeName), Buffer.from(bytes));

        return {
          name:     file.name,
          filename: safeName,
          url:      `/uploads/${safeName}`,
          size:     file.size,
          type:     file.type,
        };
      })
    );

    return NextResponse.json({ files: results });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
