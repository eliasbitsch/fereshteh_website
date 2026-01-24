import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import { getProjectsMetadata, setProjectMetadata } from "~/lib/projects-metadata";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

export async function GET() {
  try {
    const meta = getProjectsMetadata();
    return NextResponse.json({ meta });
  } catch (error) {
    console.error("Get projects metadata error:", error);
    return NextResponse.json({ error: "Failed to get metadata" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, data } = body as { key: string; data: { title?: string; subtitle?: string } };

    if (!key || !data) {
      return NextResponse.json({ error: "Key and data are required" }, { status: 400 });
    }

    setProjectMetadata(key, { title: data.title || undefined, subtitle: data.subtitle || undefined });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update projects metadata error:", error);
    return NextResponse.json({ error: "Failed to update metadata" }, { status: 500 });
  }
}
