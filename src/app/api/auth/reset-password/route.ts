import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSession,
  isValidEmail,
  resetPasswordWithToken,
  validateResetToken,
} from "~/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!(token && password && confirmPassword)) {
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

    const email = validateResetToken(token);
    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Ensure the token belongs to a configured admin email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Reset tokens are only valid for admin accounts" },
        { status: 400 }
      );
    }

    const success = resetPasswordWithToken(token, password);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 }
      );
    }

    // Automatically log in after reset
    const sessionToken = createSession(email);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
