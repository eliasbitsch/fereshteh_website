import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import { type ContentData, getContent, saveContent } from "~/lib/content";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) {
    return false;
  }
  return validateSession(token) !== null;
}

export async function GET() {
  try {
    const content = getContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { error: "Failed to get content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content: ContentData = await request.json();
    saveContent(content);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Update content error:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}
