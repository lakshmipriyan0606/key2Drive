"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Car,
  Compass,
  Plane,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Info,
  Calendar,
  Briefcase,
  UserCheck,
  PhoneCall,
  MapPin,
  Sparkles,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";

interface TariffItem {
  id: string;
  title: string;
  vehicleCategory: string;
  baseRate: number;
  includedHours: number | null;
  includedKm: number | null;
  extraHourRate: number;
  extraKmRate: number;
  nightChargeRate: number;
  waitingChargePerMin: number;
  cancellationPolicy: string | null;
  isUnconfirmed: boolean;
  service: {
    id: string;
    slug: string;
    title: string;
    priceUnit: string;
  };
}

interface ServiceTab {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  image: string;
  defaultPrice: number;
  priceUnit: string;
  minHoursText: string;
  includedKmText?: string;
  badge: string;
  features: string[];
  icon: React.ReactNode;
}

const TARIFF_TABS: ServiceTab[] = [
  {
    id: "hourly",
    title: "Hourly Driver",
    slug: "hourly-driver",
    tagline: "Ideal for city errands, medical visits, shopping, and dinner commutes",
    image: "/images/chauffeur-indian.jpg",
    defaultPrice: 399,
    priceUnit: "hour",
    minHoursText: "Minimum 4-hour flexible booking",
    includedKmText: "Unlimited city kilometers within municipal limits",
    badge: "Most Popular City Choice",
    icon: <Clock className="w-3.5 h-3.5 shrink-0" />,
    features: [
      "100% Police-verified, background-checked professional chauffeur",
      "Certified competence in Manual, Automatic & EV transmissions",
      "Doorstep arrival 10 minutes ahead of scheduled pickup",
      "Zero surge guarantee during rush hours, rain, or festivities",
    ],
  },
  {
    id: "full-day",
    title: "Full Day Driver",
    slug: "full-day-driver",
    tagline: "Dedicated 8-hour executive chauffeur on standby for uninterrupted mobility",
    image: "/images/hero-mercedes.jpg",
    defaultPrice: 1899,
    priceUnit: "day",
    minHoursText: "8 hours inclusive workday package",
    includedKmText: "Includes up to 80 km city travel with multiple stopovers",
    badge: "Executive Standard",
    icon: <Car className="w-3.5 h-3.5 shrink-0" />,
    features: [
      "Dedicated personal chauffeur at your vehicle's disposal all day",
      "Unlimited stopovers for meetings, shopping, and family errands",
      "Expertise in premium sedans, luxury SUVs, and executive fleets",
      "Transparent overtime billing calibrated per half-hour increment",
    ],
  },
  {
    id: "airport",
    title: "Airport Transfer",
    slug: "airport-transfer",
    tagline: "Punctual, stress-free terminal pickup and departure transfers",
    image: "/images/tariff-airport-indian.jpg",
    defaultPrice: 799,
    priceUnit: "transfer",
    minHoursText: "Direct point-to-point transfer",
    includedKmText: "Direct expressway airport transit route",
    badge: "Guaranteed Punctuality",
    icon: <Plane className="w-3.5 h-3.5 shrink-0" />,
    features: [
      "Guaranteed on-time doorstep arrival or terminal curb greeting",
      "Proactive live flight arrival and departure tracking",
      "Luggage loading and careful handling of executive baggage",
      "Complimentary 30-minute waiting window for baggage carousel delays",
    ],
  },
  {
    id: "outstation",
    title: "Outstation Trips",
    slug: "outstation-driver",
    tagline: "Seasoned highway drivers for intercity journeys and weekend getaways",
    image: "/images/tariff-outstation-indian.jpg",
    defaultPrice: 2499,
    priceUnit: "day",
    minHoursText: "24-hour daily outstation package",
    includedKmText: "Calibrated 300 km daily highway allowance",
    badge: "Intercity Highway Specialist",
    icon: <Compass className="w-3.5 h-3.5 shrink-0" />,
    features: [
      "Seasoned highway chauffeurs with extensive night-driving pedigree",
      "All-India route competence across Ghats, expressways, and state borders",
      "Complete familiarity with FASTag lanes and intercity toll crossings",
      "Driver food & overnight boarding allowance transparently bundled",
    ],
  },
  {
    id: "corporate",
    title: "Corporate Retainer",
    slug: "corporate-chauffeur",
    tagline: "Dedicated monthly chauffeurs for C-suite executives and company fleets",
    image: "/images/hero-mercedes.jpg",
    defaultPrice: 34999,
    priceUnit: "month",
    minHoursText: "26 working days / 10 hours daily",
    includedKmText: "Comprehensive monthly corporate mobility",
    badge: "Corporate Fleet Agreement",
    icon: <Briefcase className="w-3.5 h-3.5 shrink-0" />,
    features: [
      "Dedicated, groomed, and English/regional language speaking chauffeur",
      "Replacement driver guarantee within 2 hours in case of chauffeur leave",
      "Strict confidentiality, route optimization, and VIP etiquette",
      "Consolidated monthly corporate billing with GST invoice",
    ],
  },
  {
    id: "personal",
    title: "Personal Chauffeur",
    slug: "personal-chauffeur",
    tagline: "Your family's trusted, private monthly acting driver for peace of mind",
    image: "/images/chauffeur-indian.jpg",
    defaultPrice: 28999,
    priceUnit: "month",
    minHoursText: "26 working days / 9 hours daily",
    includedKmText: "Daily family commute, school runs & errands",
    badge: "Family Peace of Mind",
    icon: <UserCheck className="w-3.5 h-3.5 shrink-0" />,
    features: [
      "Vetted, polite, and verified family driver with spotless driving record",
      "Daily vehicle care: routine fluid checks, windshield cleaning, tire inspection",
      "Safe school runs, elderly family transportation, and weekend outings",
      "Flexible monthly retainers with replacement backup coverage",
    ],
  },
];

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<TariffItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("hourly-driver");

  useEffect(() => {
    async function fetchTariffs() {
      try {
        const res = await fetch("/api/tariffs");
        const json = await res.json();
        if (json.success && Array.isArray(json.tariffs)) {
          setTariffs(json.tariffs);
        }
      } catch (err) {
        console.error("Failed to load tariffs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTariffs();
  }, []);

  const currentTab = TARIFF_TABS.find((t) => t.slug === activeTab) || TARIFF_TABS[0];
  const currentTariff = tariffs.find((t) => t.service?.slug === activeTab);

  const displayRate = currentTariff?.baseRate || currentTab.defaultPrice;
  const displayUnit = currentTariff?.service?.priceUnit || currentTab.priceUnit;

  return (
    <div className="flex flex-col min-h-screen bg-brand-warm-bg font-sans">
      {/* Editorial Hero Banner: Authentic Indian Luxury Mobility */}
      <section className="bg-gradient-to-b from-[#0A1628] via-brand-navy to-[#0F1E33] text-white relative overflow-hidden py-14 sm:py-20 border-b border-white/10">
        {/* Subtle warm amber ambient glow */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(242,140,0,0.18),rgba(255,255,255,0))] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Title & Indian Value Proposition */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-orange" />
                <span>All-India RTO & Commercial Tariff Transparency</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-[1.15] font-manrope">
                Our Tariff & Pricing
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
                Predictable, slab-based pricing with strictly zero peak-hour or weather surges.
                Verified professional Indian chauffeurs for your personal and executive cars across
                Bengaluru, Mumbai, Delhi-NCR, and Hyderabad.
              </p>

              {/* 3 Trust Markers Strip */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>Strict Zero Surge Policy</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>Police-Verified Drivers</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>FASTag & Toll Clarity</span>
                </div>
              </div>
            </div>

            {/* Right Showcase Visual: Indian Luxury Airport & Chauffeur Scene */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-brand-navy-deep/60 aspect-[16/10] group">
                <img
                  src="/images/tariff-airport-indian.jpg"
                  alt="Key2Drive Indian Airport Chauffeur Showcase"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 bg-brand-navy/80 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white font-manrope">
                        Executive Chauffeur Dispatch
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Bengaluru Kempegowda T2, Mumbai BOM & Delhi DEL
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-brand-orange text-[10px] font-bold">
                      24/7 Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Client Review Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-amber-950 leading-relaxed font-medium">
              <span className="font-bold text-amber-900">[Pending Client Review] Reference Pricing Slabs: </span>
              The tariffs, extra-hour rates, and allowances detailed below are standardized operational benchmark rates.
              Commercial corporate and fleet pricing can be configured or updated via the Admin Portal.
            </div>
          </div>
        </div>
      </div>

      {/* Main Tariff Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Service Tab Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {TARIFF_TABS.map((tab) => {
              const isActive = activeTab === tab.slug;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.slug)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs ${
                    isActive
                      ? "bg-brand-navy text-white ring-2 ring-brand-orange shadow-md"
                      : "bg-white text-brand-navy border border-brand-border hover:border-brand-orange/50 hover:bg-gray-50"
                  }`}
                >
                  <span className={isActive ? "text-brand-orange" : "text-brand-navy/60"}>
                    {tab.icon}
                  </span>
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>

          {/* Split Layout: Left Featured Showcase Card | Right Surcharges & Policies */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Card: Selected Service Showcase */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Authentic Indian Automotive Photography */}
              <div className="h-64 sm:h-72 w-full relative bg-brand-navy overflow-hidden group">
                <img
                  src={currentTab.image}
                  alt={currentTab.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-brand-navy/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-md">
                    {currentTab.badge}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-semibold text-brand-orange uppercase tracking-wider block">
                    Verified Chauffeur Service
                  </span>
                  <h3 className="text-xl font-bold font-manrope text-white">
                    {currentTab.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight font-manrope">
                    {currentTab.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary-text mt-1 leading-relaxed">
                    {currentTab.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-4 sm:p-5 rounded-2xl bg-brand-warm-bg/80 border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
                      Standard Benchmark Rate
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-manrope">
                        ₹{displayRate.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-secondary-text">
                        / {displayUnit}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      Zero Surge Guaranteed
                    </span>
                    <p className="text-xs text-secondary-text mt-1 font-medium">
                      {currentTab.minHoursText}
                    </p>
                  </div>
                </div>

                {/* Inclusions & Highlights */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                    Package Inclusions & Standard Rules
                  </h4>
                  <div className="space-y-2.5">
                    {currentTab.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-navy font-medium leading-relaxed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Now Button */}
                <div className="pt-2">
                  <Link href={`/book?service=${currentTab.slug}`} className="block w-full">
                    <ButtonMotion
                      variant="accent"
                      size="lg"
                      className="w-full justify-center !rounded-xl font-bold py-3.5 shadow-md hover:shadow-lg text-sm"
                      rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}
                    >
                      Book {currentTab.title} Now
                    </ButtonMotion>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Cards: Additional Charges & Indian Operational Clarity */}
            <div className="lg:col-span-5 space-y-6">
              {/* Additional Charges Card */}
              <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="text-base font-bold text-brand-navy font-manrope">
                    Additional Slabs & Allowances
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Transparent
                  </span>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-brand-border/60">
                    <div>
                      <span className="text-brand-navy font-bold block">Extra Driving Hour</span>
                      <span className="text-[11px] text-secondary-text">Beyond package hours</span>
                    </div>
                    <span className="font-extrabold text-brand-navy font-manrope">
                      ₹{currentTariff?.extraHourRate || 150} / hr
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-brand-border/60">
                    <div>
                      <span className="text-brand-navy font-bold block">Extra Distance</span>
                      <span className="text-[11px] text-secondary-text">For full-day & outstation</span>
                    </div>
                    <span className="font-extrabold text-brand-navy font-manrope">
                      ₹{currentTariff?.extraKmRate || 12} / km
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-brand-border/60">
                    <div>
                      <span className="text-brand-navy font-bold block">Night Surcharge</span>
                      <span className="text-[11px] text-secondary-text">Active between 10:00 PM – 06:00 AM</span>
                    </div>
                    <span className="font-extrabold text-brand-navy font-manrope">
                      ₹{currentTariff?.nightChargeRate || 300} / trip
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <span className="text-brand-navy font-bold block">Tolls, Parking & FASTag</span>
                      <span className="text-[11px] text-secondary-text">State taxes & airport parking</span>
                    </div>
                    <span className="font-semibold text-secondary-text text-right text-xs">
                      At Actual Cost
                    </span>
                  </div>
                </div>
              </div>

              {/* RTO & Driver Pedigree Guarantee */}
              <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-brand-navy">
                  <ShieldCheck className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-base font-bold font-manrope">
                    All-India Chauffeur Standard
                  </h3>
                </div>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Every driver holds a valid Indian Commercial/Badge Driving License, has undergone
                  police background verification, and is trained in courteous hospitality for family and executive travel.
                </p>
                <div className="pt-1">
                  <Link
                    href="/terms"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
                  >
                    <span>Review Full Terms & Cancellation Policy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Quick Concierge Dispatch Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0F1E33] to-brand-navy text-white space-y-3 border border-white/10 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                    Custom Route or Multi-City Tour?
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Planning an outstation weekend to Coorg, Ooty, Pune, or Agra? Speak directly with our concierge dispatch team for custom tailored itineraries.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/contact"
                    className="w-full text-center py-2.5 px-4 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-[#d97d00] transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <span>Contact Concierge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 px-4 rounded-xl bg-emerald-600/90 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
