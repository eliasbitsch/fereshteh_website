"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl font-bold">Invalid Reset Link</h1>
          <p className="text-muted-fg">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/admin/forgot-password"
            className="inline-block text-primary hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      router.push("/admin");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-muted-fg">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Enter new password (min 8 characters)"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-fg"
              >
                {showPassword ? (
                  <Icons.EyeOff className="size-5" />
                ) : (
                  <Icons.Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3" isDisabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
