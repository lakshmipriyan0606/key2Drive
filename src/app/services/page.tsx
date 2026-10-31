"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Car,
  Plane,
  Compass,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LayoutGrid,
  List,
  Sparkles,
  Check,
  PhoneCall,
  Calendar,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string;
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
}

// Authentic executive automotive & chauffeur photography
const SERVICE_IMAGES: Record<string, string> = {
  "hourly-driver":
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop", // Executive Black Mercedes/BMW in city
  "full-day-driver":
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop", // Premium Executive Chauffeur Saloon
  "airport-transfer":
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop", // Aviation / Airport Terminal Departure
  "outstation-driver":
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1000&auto=format&fit=crop", // Highway Luxury SUV on open expressway
  "corporate-services":
    "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop", // Executive corporate fleet
  "personal-chauffeur":
    "/images/chauffeur-indian.jpg", // Authentic Verified Indian Chauffeur
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop";

const CATEGORY_TABS = [
  { id: "all", label: "All Services" },
  { id: "hourly", label: "Hourly & Daily", slugs: ["hourly-driver", "full-day-driver"] },
  { id: "airport", label: "Airport Transfers", slugs: ["airport-transfer"] },
  { id: "outstation", label: "Outstation Trips", slugs: ["outstation-driver"] },
  { id: "corporate", label: "Corporate & Monthly", slugs: ["corporate-services", "personal-chauffeur"] },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const json = await res.json();
        if (json.success && Array.isArray(json.services)) {
          setServices(json.services);
        }
      } catch (err) {
        console.error("Failed to load services from API", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const parseFeatures = (featuresJsonOrStr: string): string[] => {
    try {
      const parsed = JSON.parse(featuresJsonOrStr);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fallback
    }
    return featuresJsonOrStr ? featuresJsonOrStr.split(",").map((s) => s.trim()) : [];
  };

  const filteredServices = services.filter((service) => {
    if (selectedCategory === "all") return true;
    const activeTab = CATEGORY_TABS.find((t) => t.id === selectedCategory);
    return activeTab?.slugs ? activeTab.slugs.includes(service.slug) : true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-brand-warm-bg">
      {/* 1. Editorial Hero Header matching Reference Design */}
      <section className="bg-brand-navy text-white relative overflow-hidden py-14 sm:py-20 border-b border-brand-navy-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left title & subtitle */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Chauffeur Tiers</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white leading-tight">
                Our Services
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed font-sans font-normal">
                Premium acting drivers and personal chauffeurs for every itinerary in your personal or corporate car. Guaranteed police-verified, courteous, and zero-surge.
              </p>
            </div>

            {/* Right luxury car visual matching reference design */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-brand-navy-deep aspect-[16/9] group">
                <img
                  src="/images/hero-mercedes.jpg"
                  alt="Key2Drive Premium Luxury Mercedes Chauffeur"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent opacity-70 pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-brand-navy/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-xs">Mercedes-Benz & Executive Fleet Certified</span>
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Available 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Controls Bar: Category Filters & View Mode Switcher */}
      <section className="border-b border-brand-border bg-white sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? "bg-brand-navy text-white shadow-sm"
                      : "bg-brand-warm-bg text-secondary-text hover:text-brand-navy hover:bg-gray-200/60"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Grid vs Compact List */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-xs text-secondary-text font-medium hidden md:inline">View Mode:</span>
            <div className="flex items-center p-1 rounded-xl bg-brand-warm-bg border border-brand-border text-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-brand-navy shadow-xs border border-brand-border/60"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
                title="Premier Travel Cards Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-white text-brand-navy shadow-xs border border-brand-border/60"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
                title="Balanced Detailed Row View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Compact View</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Services Presentation */}
      <section className="py-12 sm:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white border border-brand-border p-6 shadow-sm animate-pulse space-y-4 h-96"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-2xl" />
                  <div className="h-6 w-1/2 bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  <div className="h-10 w-full bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            /* ===== BEST VIEW: PREMIER 3-COLUMN LUXURY TRAVEL CARDS ===== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredServices.map((service) => {
                const featureList = parseFeatures(service.features);
                const carImage = SERVICE_IMAGES[service.slug] || DEFAULT_IMAGE;

                return (
                  <div
                    key={service.id}
                    id={service.slug}
                    className="rounded-3xl bg-white border border-brand-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group hover:border-brand-orange/50"
                  >
                    <div>
                      {/* Top Visual Image with Overlaid Floating Price Pill */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-navy">
                        <img
                          src={carImage}
                          alt={service.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent pointer-events-none" />

                        {/* Floating Price Pill in Top Right */}
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-3.5 py-1.5 rounded-full bg-brand-navy/90 backdrop-blur-md border border-white/20 text-white font-bold text-xs shadow-md inline-flex items-center gap-1 font-heading">
                            <span className="text-brand-orange">Starting</span>
                            <span>₹{service.basePrice.toLocaleString()}</span>
                          </span>
                        </div>

                        {/* Category Pill in Top Left */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2.5 py-1 rounded-full bg-brand-orange text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                            Verified Tier
                          </span>
                        </div>

                        {/* Bottom Vehicle Tagline in image */}
                        <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
                          <span className="text-[11px] font-sans text-brand-orange font-bold uppercase tracking-wider block">
                            {service.priceUnit}
                          </span>
                        </div>
                      </div>

                      {/* Card Content & Features */}
                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <h2 className="text-xl font-heading font-extrabold text-brand-navy group-hover:text-brand-orange transition-colors">
                            {service.title}
                          </h2>
                          <p className="text-xs text-secondary-text font-sans leading-relaxed line-clamp-2">
                            {service.description || service.tagline}
                          </p>
                        </div>

                        {/* Inclusions Feature Checklist */}
                        <div className="p-3.5 rounded-2xl bg-brand-warm-bg border border-brand-border/60 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text block">
                            Included in this Service:
                          </span>
                          {featureList.slice(0, 3).map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs text-brand-navy font-medium"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer & Full-Width CTA */}
                    <div className="p-6 pt-0">
                      <Link href={`/book?service=${service.slug}`} className="block w-full">
                        <ButtonMotion
                          variant="accent"
                          size="md"
                          className="w-full !rounded-2xl !py-3 font-bold shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
                        >
                          <span>Book This Service</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </ButtonMotion>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ===== BALANCED COMPACT LIST VIEW (NO DEAD SPACE) ===== */
            <div className="max-w-5xl mx-auto space-y-5">
              {filteredServices.map((service) => {
                const featureList = parseFeatures(service.features);
                const carImage = SERVICE_IMAGES[service.slug] || DEFAULT_IMAGE;

                return (
                  <div
                    key={service.id}
                    id={service.slug}
                    className="flex flex-col md:flex-row items-stretch rounded-3xl bg-white border border-brand-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-brand-orange/40 group"
                  >
                    {/* Left: Balanced Image Thumbnail (35% width) */}
                    <div className="w-full md:w-80 h-52 md:h-auto relative overflow-hidden bg-brand-navy shrink-0">
                      <img
                        src={carImage}
                        alt={service.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-brand-orange text-white font-bold text-[10px] uppercase tracking-wider">
                          Key2Drive Tier
                        </span>
                      </div>
                    </div>

                    {/* Middle: Rich Content & Feature Badges */}
                    <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h2 className="text-xl font-heading font-extrabold text-brand-navy group-hover:text-brand-orange transition-colors">
                          {service.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
                          {service.description || service.tagline}
                        </p>
                      </div>

                      {/* Inclusions Chips */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {featureList.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-warm-bg border border-brand-border text-[11px] font-semibold text-brand-navy"
                          >
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>{f}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Dedicated Pricing & Action Box */}
                    <div className="w-full md:w-56 p-6 border-t md:border-t-0 md:border-l border-brand-border bg-brand-warm-bg/50 flex flex-col items-center justify-center text-center gap-3 shrink-0">
                      <div>
                        <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">
                          Base Tariff
                        </span>
                        <div className="font-heading font-black text-2xl text-brand-navy">
                          ₹{service.basePrice.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-brand-orange font-semibold block">
                          {service.priceUnit}
                        </span>
                      </div>

                      <Link href={`/book?service=${service.slug}`} className="w-full">
                        <ButtonMotion
                          variant="accent"
                          size="md"
                          className="w-full !rounded-xl !py-2.5 font-bold shadow-sm text-xs"
                        >
                          Book Now
                        </ButtonMotion>
                      </Link>

                      <span className="text-[10px] text-secondary-text flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Zero Surge Guarantee</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Bottom Fleet & Dedicated Chauffeur Callout Strip */}
          <div className="mt-14 rounded-3xl bg-brand-navy text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Enterprise & Custom Solutions</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Need a Dedicated Corporate Fleet or Monthly Chauffeur?
              </h3>
              <p className="text-white/70 text-xs sm:text-sm max-w-xl">
                We provide custom corporate transportation agreements, dedicated monthly drivers for executive vehicles, and luxury wedding event fleets.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <Link href="/contact" className="w-full sm:w-auto">
                <ButtonMotion
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto !rounded-full !px-7 font-bold !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 text-xs"
                >
                  Contact Corporate Desk
                </ButtonMotion>
              </Link>

              <a
                href="tel:+919876543210"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+91 98765 43210</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
