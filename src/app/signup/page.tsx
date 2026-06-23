"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MagneticCursor } from "@/components/ui/magnetic-cursor";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      // Register
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.message || "Registration failed.");
        return;
      }

      // Auto-login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (loginData.success) {
        router.push("/dashboards");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "var(--foreground)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-sans)",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <MagneticCursor magneticFactor={0.3} cursorSize={28} blendMode="exclusion">
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-x-hidden">
        {/* Background glow */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(115,115,115,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-[440px] relative z-10">
          {/* Logo */}
          <div className="text-center mb-8 sm:mb-10">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
              <Image src="/logo.svg" alt="Voxora" width={28} height={28} />
              <span className="text-xl font-semibold text-foreground">Voxora</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-xl">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mb-8">
              Start deploying AI voice agents today
            </p>

            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-foreground">
                  Full name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none transition-colors duration-200 focus:border-ring font-sans w-full"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-foreground">
                  Work email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none transition-colors duration-200 focus:border-ring font-sans w-full"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-foreground">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none transition-colors duration-200 focus:border-ring font-sans w-full"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/25 rounded-lg px-3.5 py-2.5 text-[13px] text-destructive">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className={`border-none rounded-lg px-6 py-3.5 text-sm font-semibold cursor-pointer transition-opacity duration-200 font-sans tracking-wide ${
                  loading
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-2">
                By signing up you agree to our{" "}
                <Link href="/terms" className="text-foreground no-underline hover:underline">Terms</Link>
                {" & "}
                <Link href="/privacy" className="text-foreground no-underline hover:underline">Privacy Policy</Link>
              </p>
            </form>
          </div>

          {/* Footer link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium no-underline hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </MagneticCursor>
  );
}
