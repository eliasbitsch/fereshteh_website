import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = validateSession(token);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      email: session.email,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
