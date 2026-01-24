import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from "node:fs";
import { join } from "node:path";
import { validateSession } from "~/lib/auth";
import { projectsSource } from "~/lib/source";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

function escapeYamlValue(value: string) {
  // Use JSON.stringify which produces a properly quoted string
  return JSON.stringify(value);
}

function updateFrontmatter(fileContent: string, updates: Record<string, string>) {
  const fmMatch = fileContent.match(/^(---\n[\s\S]*?\n---\n?)/);

  if (!fmMatch) {
    // No frontmatter — create one
    const lines = Object.entries(updates)
      .map(([k, v]) => `${k}: ${escapeYamlValue(v)}`)
      .join("\n");

    return `---\n${lines}\n---\n\n${fileContent}`;
  }

  const fm = fmMatch[1];
  const fmBody = fm.replace(/^---\n|\n---\n?$/g, "");
  const fmLines = fmBody.split(/\r?\n/);

  const updatedLines = [...fmLines];

  for (const [key, value] of Object.entries(updates)) {
    const idx = updatedLines.findIndex((l) => l.trim().startsWith(`${key}:`));
    const line = `${key}: ${escapeYamlValue(value)}`;

    if (idx >= 0) {
      updatedLines[idx] = line;
    } else {
      // insert after name if present, otherwise at start
      const nameIdx = updatedLines.findIndex((l) => l.trim().startsWith("name:"));
      if (nameIdx >= 0) {
        updatedLines.splice(nameIdx + 1, 0, line);
      } else {
        updatedLines.unshift(line);
      }
    }
  }

  const newFm = `---\n${updatedLines.join("\n")}\n---\n`;

  return fileContent.replace(fm, newFm);
}

export async function GET() {
  try {
    const pages = projectsSource.getPages();

    const projects = pages.map((p) => ({
      path: p.path,
      url: p.url,
      name: p.data.name,
      subtitle: (p.data as any).subtitle || null,
    }));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Failed to get projects" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { path: filePath, data } = body as { path: string; data: Record<string, string> };

    if (!filePath || !data) {
      return NextResponse.json({ error: "File path and data are required" }, { status: 400 });
    }

    const absPath = join(process.cwd(), filePath);

    if (!fs.existsSync(absPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = fs.readFileSync(absPath, "utf-8");
    const newContent = updateFrontmatter(content, data);

    fs.writeFileSync(absPath, newContent, "utf-8");

    // Return updated list
    const pages = projectsSource.getPages();
    const projects = pages.map((p) => ({
      path: p.path,
      url: p.url,
      name: p.data.name,
      subtitle: (p.data as any).subtitle || null,
    }));

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
