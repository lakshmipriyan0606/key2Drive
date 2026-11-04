"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import BrandLogo from "@/components/ui/BrandLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      toast.success("Welcome back, Administrator!");
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
      toast.error(err.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1628] via-brand-navy to-[#070D18] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(242,140,0,0.15),rgba(255,255,255,0))] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Identity & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center">
            <BrandLogo variant="white" size="md" href="/" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-manrope">
            Key2Drive Admin Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-sm mx-auto font-normal leading-relaxed">
            Restricted access for dispatch supervisors and system administrators.
          </p>
        </div>

        {/* Card Form: Crisp Pearl-White Luxury Card for Maximum High-Contrast Readability */}
        <div className="mt-7 bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-brand-border/60 space-y-6">
          {/* Security Status Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                Supervisor Sign In
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              256-bit Secure
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2" role="alert" aria-live="polite">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-bold text-brand-navy tracking-tight">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-orange absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  spellCheck={false}
                  placeholder="admin@key2drive.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-brand-warm-bg/70 border border-brand-border text-brand-navy font-semibold placeholder:text-gray-400 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-bold text-brand-navy tracking-tight">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-brand-orange absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-brand-warm-bg/70 border border-brand-border text-brand-navy font-semibold placeholder:text-gray-400 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm shadow-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-brand-navy/50 hover:text-brand-orange p-0.5 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <ButtonMotion
                variant="accent"
                size="lg"
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full justify-center !rounded-xl font-bold py-3.5 shadow-md hover:shadow-lg text-sm"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />}
              >
                {isLoading ? "Authenticating…" : "Sign In to Admin Portal"}
              </ButtonMotion>
            </div>
          </form>

          {/* Footer Security Microcopy inside card */}
          <p className="text-[11px] text-secondary-text text-center pt-1 leading-relaxed">
            Encrypted administrative session. Unauthorized access attempts are monitored and logged.
          </p>
        </div>

        {/* High-Contrast Return Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-brand-orange transition-colors py-2 px-4 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-0.5" />
            Return to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
}
