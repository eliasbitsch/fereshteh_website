import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { normalizeProjectFilename } from "~/lib/projects-pdf";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "name parameter is required" },
      { status: 400 }
    );
  }

  const safeName = normalizeProjectFilename(name);
  const jpgDir = join(process.cwd(), "public", "projects-jpg");
  const statusPath = join(jpgDir, `${safeName}.status.json`);

  if (existsSync(statusPath)) {
    try {
      const data = JSON.parse(readFileSync(statusPath, "utf-8"));
      return NextResponse.json(data);
    } catch {}
  }

  return NextResponse.json({
    status: "none",
    currentPage: 0,
    totalPages: 0,
  });
}
