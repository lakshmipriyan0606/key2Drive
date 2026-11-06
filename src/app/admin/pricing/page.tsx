"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";

export default function AdminPricingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to services management per client instruction
    const timer = setTimeout(() => {
      router.replace("/admin/services");
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 pt-12">
      <div className="bg-white rounded-3xl border border-brand-border p-8 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-brand-orange border border-amber-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-brand-navy font-manrope">
          Custom Quote on Call / WhatsApp
        </h1>
        <p className="text-sm text-secondary-text leading-relaxed">
          In accordance with business policy, fixed prices are not displayed. Our dispatch team contacts customers directly via Call / WhatsApp upon booking to discuss trip details and provide customized quotes.
        </p>
        <div className="pt-4 flex justify-center">
          <Link href="/admin/services">
            <ButtonMotion variant="accent" size="md">
              Go to Services Management
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </ButtonMotion>
          </Link>
        </div>
      </div>
    </div>
  );
}
