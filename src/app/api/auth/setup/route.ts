import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSession,
  hasPasswordSet,
  isValidEmail,
  setPassword,
} from "~/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword } = await request.json();

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email is not authorized for admin access" },
        { status: 403 }
      );
    }

    if (hasPasswordSet(email)) {
      return NextResponse.json(
        { error: "Password already set. Use forgot password to reset." },
        { status: 400 }
      );
    }

    const success = setPassword(email, password);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to set password" },
        { status: 500 }
      );
    }

    // Automatically log in after setup
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
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "An error occurred during setup" },
      { status: 500 }
    );
  }
}
