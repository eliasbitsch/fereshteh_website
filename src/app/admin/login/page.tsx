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
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Set Up Your Password</h1>
            <p className="mt-2 text-muted-fg">
              Create a password for your admin account
            </p>
          </div>

          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-lg border bg-secondary/20 text-muted-fg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter password (min 8 characters)"
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
                placeholder="Confirm password"
                required
                minLength={8}
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
              {loading ? "Setting up..." : "Set Password & Login"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setNeedsSetup(false);
                setPassword("");
                setConfirmPassword("");
              }}
              className="w-full text-sm text-muted-fg hover:text-fg"
            >
              Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="mt-2 text-muted-fg">
            Sign in to manage your website content
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Enter your password"
                required
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center">
            <a
              href="/admin/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
