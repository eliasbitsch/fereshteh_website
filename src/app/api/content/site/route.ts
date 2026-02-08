import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import { type SiteContent, updateSite } from "~/lib/content";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) {
    return false;
  }
  return validateSession(token) !== null;
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const site: Partial<SiteContent> = await request.json();
    const content = updateSite(site);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Update site error:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}
