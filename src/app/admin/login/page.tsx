"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsSetup) {
          setNeedsSetup(true);
          setError("");
        } else {
          setError(data.error || "Login failed");
        }
        return;
      }

      router.push("/admin");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Setup failed");
        return;
      }

      router.push("/admin");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (needsSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-bold text-3xl">Set Up Your Password</h1>
            <p className="mt-2 text-muted-fg">
              Create a password for your admin account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSetup}>
            <div>
              <label className="mb-2 block font-medium text-sm">Email</label>
              <input
                className="w-full rounded-lg border bg-secondary/20 px-4 py-3 text-muted-fg"
                disabled
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">Password</label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 8 characters)"
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
                placeholder="Confirm password"
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
              {loading ? "Setting up..." : "Set Password & Login"}
            </Button>

            <button
              className="w-full text-muted-fg text-sm hover:text-fg"
              onClick={() => {
                setNeedsSetup(false);
                setPassword("");
                setConfirmPassword("");
              }}
              type="button"
            >
              Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-bold text-3xl">Admin Login</h1>
          <p className="mt-2 text-muted-fg">
            Sign in to manage your website content
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
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

          <div>
            <label className="mb-2 block font-medium text-sm">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          {error && (
            <div className="rounded-lg bg-danger/10 p-3 text-danger text-sm">
              {error}
            </div>
          )}

          <Button className="w-full py-3" isDisabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center">
            <a
              className="text-primary text-sm hover:underline"
              href="/admin/forgot-password"
            >
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
