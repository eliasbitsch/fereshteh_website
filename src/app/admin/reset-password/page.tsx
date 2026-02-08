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
      <div className="flex min-h-screen items-center justify-center bg-bg p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="font-bold text-3xl">Invalid Reset Link</h1>
          <p className="text-muted-fg">
            This password reset link is invalid or has expired.
          </p>
          <Link
            className="inline-block text-primary hover:underline"
            href="/admin/forgot-password"
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
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-bold text-3xl">Reset Password</h1>
          <p className="mt-2 text-muted-fg">Enter your new password</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block font-medium text-sm">
              New Password
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-fg hover:text-fg"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
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
            <label className="mb-2 block font-medium text-sm">
              Confirm Password
            </label>
            <input
              className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              type="password"
              value={confirmPassword}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-danger/10 p-3 text-danger text-sm">
              {error}
            </div>
          )}

          <Button className="w-full py-3" isDisabled={loading} type="submit">
            {loading ? "Resetting..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
