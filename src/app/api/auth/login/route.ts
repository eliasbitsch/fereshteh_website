import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSession,
  hasPasswordSet,
  isValidEmail,
  validateCredentials,
} from "~/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email is not authorized for admin access" },
        { status: 403 }
      );
    }

    if (!hasPasswordSet(email)) {
      return NextResponse.json(
        { error: "Please set up your password first", needsSetup: true },
        { status: 403 }
      );
    }

    if (!validateCredentials(email, password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = createSession(email);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
