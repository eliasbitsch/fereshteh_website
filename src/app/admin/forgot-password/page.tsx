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
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold">Check Your Email</h1>
            <p className="mt-4 text-muted-fg">
              If your email is registered, you will receive a password reset
              link shortly.
            </p>
          </div>

          {resetUrl && (
            <div className="p-4 rounded-lg bg-secondary/20 text-sm">
              <p className="font-medium mb-2">Development Mode:</p>
              <Link
                href={resetUrl}
                className="text-primary hover:underline break-all"
              >
                Click here to reset password
              </Link>
            </div>
          )}

          <Link
            href="/admin/login"
            className="inline-block text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="mt-2 text-muted-fg">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3"
            isDisabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Link
              href="/admin/login"
              className="text-sm text-muted-fg hover:text-fg"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
