import { createReadStream, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Readable } from "node:stream";

const ALLOWED_DIRS = [
  "projects",
  "projects-jpg",
  "projects-thumbnails",
  "portfolio-images",
  "profile-picture",
  "documents",
];

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path || path.length < 2) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const [dir, ...rest] = path;
  if (!ALLOWED_DIRS.includes(dir)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = join(process.cwd(), "public", dir, ...rest);

  // Prevent path traversal
  const publicDir = join(process.cwd(), "public");
  if (!filePath.startsWith(publicDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const stat = statSync(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const stream = createReadStream(filePath);
  const readable = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(readable, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
