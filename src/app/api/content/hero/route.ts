import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import { type HeroContent, updateHero } from "~/lib/content";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hero: Partial<HeroContent> = await request.json();
    const content = updateHero(hero);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Update hero error:", error);
    return NextResponse.json(
      { error: "Failed to update hero" },
      { status: 500 }
    );
  }
}
