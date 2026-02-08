import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import { type SkillContent, updateSkills } from "~/lib/content";

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

    const skills: SkillContent[] = await request.json();
    const content = updateSkills(skills);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Update skills error:", error);
    return NextResponse.json(
      { error: "Failed to update skills" },
      { status: 500 }
    );
  }
}
