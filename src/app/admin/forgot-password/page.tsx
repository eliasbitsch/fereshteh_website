"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setSuccess(true);
      // In development, show the reset URL directly
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="font-bold text-3xl">Check Your Email</h1>
            <p className="mt-4 text-muted-fg">
              If your email is registered, you will receive a password reset
              link shortly.
            </p>
          </div>

          {resetUrl && (
            <div className="rounded-lg bg-secondary/20 p-4 text-sm">
              <p className="mb-2 font-medium">Development Mode:</p>
              <Link
                className="break-all text-primary hover:underline"
                href={resetUrl}
              >
                Click here to reset password
              </Link>
            </div>
          )}

          <Link
            className="inline-block text-primary hover:underline"
            href="/admin/login"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-bold text-3xl">Forgot Password</h1>
          <p className="mt-2 text-muted-fg">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block font-medium text-sm">Email</label>
            <input
              className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              type="email"
              value={email}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-danger/10 p-3 text-danger text-sm">
              {error}
            </div>
          )}

          <Button className="w-full py-3" isDisabled={loading} type="submit">
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Link
              className="text-muted-fg text-sm hover:text-fg"
              href="/admin/login"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
