import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { destroySession } from "~/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (token) {
      destroySession(token);
    }

    cookieStore.delete("admin_session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
