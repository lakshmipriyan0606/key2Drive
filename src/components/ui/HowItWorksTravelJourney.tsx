"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  PhoneCall,
  Check,
  Compass,
} from "lucide-react";
import ButtonMotion from "./ButtonMotion";
import { CONTACT_DETAILS } from "@/lib/constants/navigation";

interface Step {
  step: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
  highlights: string[];
}

const STEPS: Step[] = [
  {
    step: "STEP 01",
    number: "01",
    title: "Select Service Tier",
    subtitle: "Hourly, Airport or Outstation",
    description:
      "Choose the exact acting driver service tailored to your itinerary with guaranteed upfront transparent pricing.",
    tag: "Instant 60s Booking",
    tagColor: "bg-amber-500/10 text-brand-orange border-brand-orange/30",
    icon: <Car className="w-6 h-6 text-brand-orange" />,
    highlights: ["Hourly, Full-day or Outstation", "Strict zero-surge fixed rates"],
  },
  {
    step: "STEP 02",
    number: "02",
    title: "Enter Trip Details",
    subtitle: "Pickup, schedule & car type",
    description:
      "Provide your doorstep pickup address, scheduled departure time, and vehicle transmission (manual, automatic, or luxury).",
    tag: "Manual & Automatic",
    tagColor: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    icon: <MapPin className="w-6 h-6 text-blue-500" />,
    highlights: ["Doorstep pickup anywhere in city", "Special driving preferences"],
  },
  {
    step: "STEP 03",
    number: "03",
    title: "Verified Driver Allocation",
    subtitle: "Assigned with credentials",
    description:
      "Receive instant confirmation with your assigned driver's verified profile photo, government driving license, direct mobile number, and live arrival updates.",
    tag: "Govt ID & DL Verified",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    highlights: ["Govt ID & Driving License verified", "Direct mobile contact & live ETA"],
  },
  {
    step: "STEP 04",
    number: "04",
    title: "Relax & Safe Arrival",
    subtitle: "Smooth executive journey",
    description:
      "Your courteous driver arrives on time, handles your car with executive care, and safely concludes your trip.",
    tag: "Direct UPI Settlement",
    tagColor: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    highlights: ["Disciplined defensive driving", "Transparent post-trip payment"],
  },
];

export default function HowItWorksTravelJourney() {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-brand-warm-bg via-white to-brand-warm-bg relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-orange/5 to-transparent pointer-events-none rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold tracking-wider uppercase font-sans">
            <Compass className="w-3.5 h-3.5 text-brand-orange" />
            <span>Executive Travel Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight font-heading">
            How Key2Drive Works
          </h2>

          <p className="text-secondary-text text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
            From doorstep booking to arrival in your own car — experience seamless, transparent, and verified acting driver travel.
          </p>
        </div>

        {/* Desktop Connected Journey Roadmap Track (Hidden on mobile) */}
        <div className="relative mb-12 hidden lg:block">
          {/* Base connecting line */}
          <div className="absolute top-8 left-16 right-16 h-1 bg-brand-border/80 rounded-full" />
          
          {/* Active progress accent line */}
          <div
            className="absolute top-8 left-16 h-1 bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${(activeStep / (STEPS.length - 1)) * 88}%` }}
          />

          {/* Connected Step Waypoints */}
          <div className="grid grid-cols-4 relative z-10">
            {STEPS.map((s, idx) => {
              const isPassed = activeStep >= idx;
              const isCurrent = activeStep === idx;

              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange rounded-xl"
                  aria-label={`Step ${s.number}: ${s.step}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-extrabold text-lg transition-[background-color,color,border-color,transform,box-shadow] duration-200 shadow-md ${
                      isCurrent
                        ? "bg-brand-orange text-white scale-110 shadow-brand-orange/30 ring-4 ring-brand-orange/20"
                        : isPassed
                        ? "bg-brand-navy text-white"
                        : "bg-white text-secondary-text border border-brand-border group-hover:border-brand-orange/40"
                    }`}
                  >
                    {isPassed && !isCurrent ? (
                      <Check className="w-6 h-6 stroke-[3]" aria-hidden="true" />
                    ) : (
                      <span>{s.number}</span>
                    )}
                  </div>
                  <span
                    className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors font-sans ${
                      isCurrent
                        ? "text-brand-orange"
                        : "text-secondary-text group-hover:text-brand-navy"
                    }`}
                  >
                    {s.step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Premium Travel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {STEPS.map((item, index) => {
            const isActive = activeStep === index;

            return (
              <div
                key={item.number}
                onMouseEnter={() => setActiveStep(index)}
                className={`relative rounded-3xl p-6 sm:p-7 transition-[border-color,box-shadow,transform] duration-200 flex flex-col justify-between border group bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 ${
                  isActive
                    ? "border-brand-orange/60 ring-2 ring-brand-orange/15 shadow-xl -translate-y-1.5"
                    : "border-brand-border hover:border-brand-orange/30"
                }`}
              >
                {/* Top Card Bar: Number Badge + Category Tag */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {/* Step Avatar / Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-brand-warm-bg border border-brand-border/80 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {item.icon}
                    </div>

                    {/* Step Number Stamp */}
                    <span className="font-heading font-black text-2xl text-brand-navy/20 group-hover:text-brand-orange/40 transition-colors">
                      {item.number}
                    </span>
                  </div>

                  {/* Feature Tag Pill */}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border font-sans ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-heading font-bold text-brand-navy group-hover:text-brand-orange transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-brand-orange font-sans">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Body Copy */}
                  <p className="text-xs text-secondary-text leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Highlight Checkmarks */}
                <div className="pt-6 mt-6 border-t border-brand-border/60 space-y-2">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-brand-navy font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Conversion Banner Strip */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-brand-navy text-white border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Instant Doorstep Driver Dispatch</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Ready to experience reliable acting driver travel?
            </h4>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              Professional acting drivers available 24/7 across Chennai, New Perungalathur, and all major travel destinations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <Link href="/book" className="w-full sm:w-auto">
              <ButtonMotion
                variant="accent"
                size="lg"
                className="w-full !rounded-full !px-8 shadow-lg font-bold text-sm"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />}
              >
                Book a Driver Now
              </ButtonMotion>
            </Link>

            <a
              href={`tel:${CONTACT_DETAILS.phoneTel}`}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              aria-label={`Call Dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
              <span>Call Dispatch: <span translate="no">{CONTACT_DETAILS.phoneDisplay}</span></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

