import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) {
    return false;
  }
  return validateSession(token) !== null;
}

function compressPdf(inputPath: string, outputPath: string): boolean {
  try {
    execSync(
      `nice -n 19 gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dNOPAUSE -dBATCH -dSAFER -dEmbedAllFonts=true -dSubsetFonts=true -dCompressFonts=true -dFastWebView=true -sOutputFile='${outputPath}' '${inputPath}'`,
      { timeout: 300_000, stdio: "pipe" }
    );
    return true;
  } catch (err) {
    console.error("PDF compression failed:", err);
    return false;
  }
}

const LOCK_FILE = "/tmp/pdf-convert.lock";
const QUEUE_FILE = "/tmp/pdf-convert-queue.json";

function isWorkerRunning(): boolean {
  if (!existsSync(LOCK_FILE)) return false;
  try {
    const pid = parseInt(readFileSync(LOCK_FILE, "utf-8").trim(), 10);
    // Check if process is alive
    process.kill(pid, 0);
    return true;
  } catch {
    // Process is dead — stale lock
    return false;
  }
}

function addToQueue(pdfPath: string, outputDir: string, baseName: string): void {
  let queue: Array<{ pdfPath: string; outputDir: string; baseName: string }> = [];
  try {
    if (existsSync(QUEUE_FILE)) {
      queue = JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));
    }
  } catch {}
  // Don't add duplicates
  if (!queue.some((j) => j.baseName === baseName)) {
    queue.push({ pdfPath, outputDir, baseName });
    writeFileSync(QUEUE_FILE, JSON.stringify(queue));
  }
  // Write queued status
  const statusPath = join(outputDir, `${baseName}.status.json`);
  writeFileSync(statusPath, JSON.stringify({ status: "queued", currentPage: 0, totalPages: 0 }));
}

function startPreviewGeneration(pdfPath: string, outputDir: string, baseName: string): void {
  // Add job to queue
  addToQueue(pdfPath, outputDir, baseName);

  // Only spawn a worker if none is running
  if (isWorkerRunning()) {
    console.log(`Worker already running. Queued ${baseName} for preview generation.`);
    return;
  }

  const scriptPath = join(process.cwd(), "scripts", "convert-pdf.py");
  const child = spawn("python3", [scriptPath, pdfPath, outputDir, baseName], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: true,
  });
  child.unref();
  console.log(`Started preview worker for ${baseName}`);
}

export async function POST(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const projectsDir = join(process.cwd(), "public", "projects");

    if (!existsSync(projectsDir)) {
      await mkdir(projectsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save original PDF to a temp location
    const originalPath = join(projectsDir, `${file.name}.original`);
    const finalPath = join(projectsDir, file.name);
    await writeFile(originalPath, buffer);

    // Compress synchronously — the admin waits, but visitors get fast loads
    console.log(`Compressing ${file.name} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)...`);
    const compressed = compressPdf(originalPath, finalPath);

    if (compressed) {
      // Delete the original, keep compressed version
      await unlink(originalPath);
      const { size } = await import("node:fs").then(fs => fs.statSync(finalPath));
      console.log(`Compressed ${file.name}: ${(buffer.length / 1024 / 1024).toFixed(1)}MB → ${(size / 1024 / 1024).toFixed(1)}MB`);
    } else {
      // Compression failed — use the original
      await rename(originalPath, finalPath);
      console.log(`Compression failed for ${file.name}, using original`);
    }

    // Generate preview images in background (for instant loading)
    const jpgDir = join(process.cwd(), "public", "projects-jpg");
    if (!existsSync(jpgDir)) {
      await mkdir(jpgDir, { recursive: true });
    }
    const safeBaseName = basename(file.name, ".pdf").toLowerCase().replace(/\s+/g, "-");
    startPreviewGeneration(finalPath, jpgDir, safeBaseName);

    return NextResponse.json({
      success: true,
      filename: file.name,
      message: compressed ? "File uploaded and optimized." : "File uploaded (optimization failed, using original).",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
