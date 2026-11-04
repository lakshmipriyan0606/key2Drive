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
  Phone,
  PhoneCall,
  MessageSquare,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { SEED_SERVICES } from "@/lib/data/seedData";
import { CONTACT_DETAILS, getWhatsAppUrl, getServiceWhatsAppUrl } from "@/lib/constants/navigation";

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string;
  featuresList?: string[];
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
}

// Authentic, relatable acting driver photography (real cars, city & travel context)
const SERVICE_IMAGES: Record<string, string> = {
  "hourly-driver":
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop", // Relatable driver behind steering wheel in city
  "full-day-driver":
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop", // Family sedan on everyday street
  "airport-transfer":
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop", // Luggage loaded for airport travel
  "outstation-driver":
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop", // Highway road trip open road
  "corporate-services":
    "https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop", // Courteous professional driver
  "personal-chauffeur":
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop", // Verified family driver
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop";

const CATEGORY_TABS = [
  { id: "all", label: "All Services" },
  { id: "hourly", label: "Hourly & Daily", slugs: ["hourly-driver", "full-day-driver"] },
  { id: "airport", label: "Airport Transfers", slugs: ["airport-transfer"] },
  { id: "outstation", label: "Outstation Trips", slugs: ["outstation-driver"] },
  { id: "corporate", label: "Corporate & Monthly", slugs: ["corporate-services", "personal-chauffeur"] },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(SEED_SERVICES as any);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const json = await res.json();
        if (json.success && Array.isArray(json.services) && json.services.length > 0) {
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
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Professional Driver Services</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white leading-tight text-balance">
                Our Services
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed font-sans font-normal">
                Professional acting drivers and personal car drivers for every itinerary in your personal or corporate car. Guaranteed background-checked, courteous, and zero-surge.
              </p>
            </div>

            {/* Right car visual */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-brand-navy-deep aspect-[16/9] group">
                <img
                  src="/images/chauffeur-indian.jpg"
                  alt="Key2Drive Professional Acting Driver Services"
                  width={600}
                  height={340}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent opacity-70 pointer-events-none" aria-hidden="true" />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-brand-navy/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-xs">Hatchback, Sedan, SUV & Luxury Car Certified</span>
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
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
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none" role="group" aria-label="Service Categories">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
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
            <div className="flex items-center p-1 rounded-xl bg-brand-warm-bg border border-brand-border text-xs" role="group" aria-label="Layout view mode">
              <button
                type="button"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
                  viewMode === "grid"
                    ? "bg-white text-brand-navy shadow-xs border border-brand-border/60"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
                title="Premier Travel Cards Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Grid View</span>
              </button>

              <button
                type="button"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
                  viewMode === "list"
                    ? "bg-white text-brand-navy shadow-xs border border-brand-border/60"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
                title="Balanced Detailed Row View"
              >
                <List className="w-3.5 h-3.5" aria-hidden="true" />
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
            /* ===== COMPACT 3-COLUMN SERVICE CARDS (CLEAN IMAGES, REDUCED HEIGHT) ===== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const featureList = parseFeatures(service.features);
                const carImage = SERVICE_IMAGES[service.slug] || DEFAULT_IMAGE;

                return (
                  <div
                    key={service.id}
                    id={service.slug}
                    className="rounded-2xl bg-white border border-brand-border overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group hover:border-brand-orange/40"
                  >
                    <div>
                      {/* Top Visual Image - Compact Height & Clean (No Overlaid Badges) */}
                      <div className="relative h-44 w-full overflow-hidden bg-brand-navy/10">
                        <img
                          src={carImage}
                          alt={service.title}
                          width={400}
                          height={176}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      {/* Card Body - Compact, Simple & Easy to Understand */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h2 className="text-lg font-heading font-extrabold text-brand-navy group-hover:text-brand-orange transition-colors">
                            {service.title}
                          </h2>
                          <p className="text-xs text-secondary-text font-sans mt-1 line-clamp-2 leading-relaxed">
                            {service.description || service.tagline}
                          </p>
                        </div>

                        {/* Compact 2-Line Key Highlights (No Bulky Inclusion Box) */}
                        <ul className="space-y-1.5 pt-2 border-t border-brand-border/60">
                          {featureList.slice(0, 2).map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Footer - Streamlined 1-Row Actions */}
                    <div className="p-5 pt-0 flex items-center gap-2">
                      <Link href={`/book?service=${service.slug}`} className="flex-1">
                        <button
                          type="button"
                          className="w-full py-2.5 px-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs shadow-xs transition-[background-color,transform] active:scale-95 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                        >
                          <span>Book Driver</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </Link>

                      <a
                        href={`tel:${CONTACT_DETAILS.phoneTel}`}
                        className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-brand-orange font-bold text-xs border border-amber-500/25 transition-colors flex items-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange tabular-nums"
                        title={`Call Dispatch: ${CONTACT_DETAILS.phoneDisplay}`}
                        aria-label={`Call Dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
                      >
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Call</span>
                      </a>

                      <a
                        href={getServiceWhatsAppUrl(service)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl sm:rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-[background-color,transform] active:scale-95 flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        title={`Chat on WhatsApp for ${service.title}`}
                        aria-label={`Chat on WhatsApp for ${service.title}`}
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
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
                    {/* Left: Balanced Image Thumbnail (No Badges) */}
                    <div className="w-full md:w-64 h-44 md:h-auto relative overflow-hidden bg-brand-navy/10 shrink-0">
                      <img
                        src={carImage}
                        alt={service.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
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
                          Pricing
                        </span>
                        <div className="font-heading font-bold text-lg text-brand-navy">
                          Custom Quote
                        </div>
                        <span className="text-[11px] text-brand-orange font-semibold block">
                          Discussed with Dispatch
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full">
                        <Link href={`/book?service=${service.slug}`} className="flex-1">
                          <ButtonMotion
                            variant="accent"
                            size="md"
                            className="w-full !rounded-xl !py-2.5 font-bold shadow-sm text-xs"
                          >
                            Book Driver
                          </ButtonMotion>
                        </Link>

                        <a
                          href={getServiceWhatsAppUrl(service)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl sm:rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-[background-color,transform] active:scale-95 flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          title={`WhatsApp Booking for ${service.title}`}
                          aria-label={`WhatsApp Booking for ${service.title}`}
                        >
                          <WhatsAppIcon className="w-4 h-4 fill-current" />
                        </a>
                      </div>

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

          {/* 4. Bottom Fleet & Dedicated Driver Callout Strip */}
          <div className="mt-12 sm:mt-14 rounded-2xl sm:rounded-3xl bg-brand-navy text-white p-5 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" aria-hidden="true" />
                <span>Enterprise & Custom Solutions</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white text-balance">
                Need a Dedicated Corporate Fleet or Monthly Driver?
              </h3>
              <p className="text-white/70 text-xs sm:text-sm max-w-xl">
                We provide custom corporate transportation agreements, dedicated monthly drivers for executive vehicles, and luxury wedding event fleets.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-[background-color,transform] active:scale-95 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange tabular-nums"
                title="Call Now for Instant Driver Dispatch"
                aria-label={`Call Key2Drive dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
              >
                <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Call Now: <span translate="no">{CONTACT_DETAILS.phoneDisplay}</span></span>
              </a>

              <a
                href={CONTACT_DETAILS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-[background-color,transform] active:scale-95 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                title="WhatsApp Booking with Greeting"
                aria-label="WhatsApp Booking with Greeting"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp</span>
              </a>

              <Link href="/contact" className="w-full sm:w-auto">
                <ButtonMotion
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto !rounded-full !px-6 font-bold !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 text-xs justify-center"
                >
                  Contact Desk
                </ButtonMotion>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
