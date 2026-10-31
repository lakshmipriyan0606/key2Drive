"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Home } from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import BrandLogo from "@/components/ui/BrandLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-warm-bg flex flex-col justify-between">
      {/* Top Bar with Brand Emblem */}
      <header className="bg-brand-navy py-4 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo variant="light" size="sm" href="/" />
          <Link
            href="/"
            className="text-xs text-white/70 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-brand-border p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto border border-brand-orange/20">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider">
              Error 404
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              Route Not Found
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
              The page you are looking for does not exist, has been relocated, or is undergoing scheduled dispatch maintenance.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <ButtonMotion
                variant="accent"
                size="md"
                className="w-full justify-center !rounded-xl font-bold shadow-sm"
                leftIcon={<ArrowLeft className="w-4 h-4 mr-1.5" />}
              >
                Back to Home
              </ButtonMotion>
            </Link>

            <Link href="/services" className="w-full sm:w-auto">
              <ButtonMotion
                variant="secondary"
                size="md"
                className="w-full justify-center !rounded-xl font-bold"
              >
                Our Services
              </ButtonMotion>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="py-4 text-center text-xs text-secondary-text border-t border-brand-border">
        © {new Date().getFullYear()} Key2Drive Mobility Solutions. All rights reserved.
      </footer>
    </div>
  );
}

