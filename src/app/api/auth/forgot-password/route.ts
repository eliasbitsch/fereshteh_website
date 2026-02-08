import { NextResponse } from "next/server";
import { createResetToken, isValidEmail } from "~/lib/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive a reset link.",
      });
    }

    const resetToken = createResetToken(email);

    if (resetToken) {
      // In production, send email here. Do NOT log reset links or tokens.
      // TODO: Integrate with email service (e.g., Resend, SendGrid, Nodemailer)
      // await sendPasswordResetEmail(email, resetUrl);
      console.log(`Password reset requested for ${email}`);
    }

    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive a reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
