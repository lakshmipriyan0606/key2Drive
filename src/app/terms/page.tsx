"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface TermSection {
  id: number;
  title: string;
  content: string[];
}

const TERMS_SECTIONS: TermSection[] = [
  {
    id: 1,
    title: "Booking Conditions",
    content: [
      "All bookings made through the Key2Drive portal or telephone dispatch represent a formal reservation request for professional acting driver services.",
      "The customer warrants that the vehicle provided is registered, roadworthy, and covered by valid comprehensive third-party insurance as mandated by Indian Motor Vehicles Act.",
      "A booking is confirmed only upon system generation of a verified Booking Reference (e.g., K2D-YYYYMMDD-XXXX).",
    ],
  },
  {
    id: 2,
    title: "Payment Terms",
    content: [
      "Standard journeys are payable post-completion directly to the assigned driver via UPI or Cash.",
      "Corporate or outstation reservations exceeding 24 hours may require an initial security deposit of 20% prior to dispatch.",
      "All tariffs are inclusive of base driver services. Parking tolls, interstate entry permits, and state border taxes remain the direct responsibility of the customer.",
    ],
  },
  {
    id: 3,
    title: "Cancellation Policy",
    content: [
      "Free cancellation is permitted up to 2 hours prior to scheduled pickup time with zero cancellation charges.",
      "Cancellations initiated within 2 hours of pickup or after driver departure to location incur a flat nominal dispatch fee of ₹150.",
      "In the event of a customer no-show after 30 minutes of scheduled arrival without notice, the booking is marked as cancelled.",
    ],
  },
  {
    id: 4,
    title: "Refunds",
    content: [
      "Advance payments or deposits eligible for refund will be processed to the original payment source within 3–5 business days.",
      "Disputed journeys or quality escalations are reviewed within 24 hours by Key2Drive Operations Lead.",
    ],
  },
  {
    id: 5,
    title: "Waiting Time",
    content: [
      "A complimentary 15-minute grace period applies to all standard city pickups from the scheduled booking time.",
      "Airport arrivals receive a 30-minute complimentary waiting window from flight touchdown.",
      "Subsequent waiting is billed at ₹100 per hour (or ₹1.67 per minute) as logged in the digital trip ledger.",
    ],
  },
  {
    id: 6,
    title: "Additional Charges",
    content: [
      "Night allowance: Trips operating between 10:00 PM and 06:00 AM incur a night surcharge of ₹250 to compensate drivers.",
      "Outstation driver food & stay allowance: Outstation trips overnight require food and lodging allowance of ₹400/night.",
      "Overtime: Extra hours beyond the booked package slab are calculated in 30-minute increments.",
    ],
  },
  {
    id: 7,
    title: "Customer Responsibilities",
    content: [
      "The vehicle owner or representative must possess all authentic vehicle documents including RC book, valid insurance policy, and PUC certificate.",
      "The customer is responsible for vehicle mechanical integrity (brakes, tires, fuel levels).",
      "Key2Drive drivers reserve the right to decline operating vehicles in visibly unsafe mechanical condition.",
    ],
  },
  {
    id: 8,
    title: "Driver Standards & Code of Conduct",
    content: [
      "Every Key2Drive driver is government ID and driving license verified, background-checked, and trained in defensive driving techniques.",
      "Drivers adhere to zero-tolerance policies regarding alcohol, substances, or reckless navigation.",
      "Drivers are instructed to respect absolute client privacy and discretion regarding conversations and belongings.",
    ],
  },
  {
    id: 9,
    title: "Privacy & Discretion",
    content: [
      "Customer contact information, itinerary details, and pickup destinations are strictly confidential and encrypted in transit.",
      "We do not sell, barter, or distribute customer trip data to third-party marketing entities under any circumstances.",
    ],
  },
  {
    id: 10,
    title: "Limitation of Liability",
    content: [
      "Key2Drive acts as a professional acting driver dispatch agency. The vehicle owner's motor insurance is the primary coverage for vehicle accidental damages.",
      "In any event of driver-attributed minor negligence, Key2Drive internal incident investigation and mediation procedures apply.",
      "Force Majeure: Neither party shall be liable for failure to perform due to acts of God, extreme flash flooding, or civil unrest.",
    ],
  },
];

export default function TermsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const toggleSection = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-warm-bg">
      {/* Editorial Hero Header matching Reference Design */}
      <section className="bg-brand-navy text-white relative overflow-hidden py-14 sm:py-20 border-b border-brand-navy-deep">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Title & subtitle */}
            <div className="md:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight text-balance">
                Terms & Conditions
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
                Please read our terms carefully.
              </p>
            </div>

            {/* Right legal visual */}
            <div className="md:col-span-4 hidden md:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop"
                  alt="Key2Drive Legal Terms & Conditions"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Client Review Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">[Pending Client Review] Reference Draft: </span>
              The policies, liability provisions, and contractual terms presented below represent a structured reference draft for Key2Drive platform operations. Subject to formal legal counsel approval.
            </div>
          </div>
        </div>
      </div>

      {/* Accordion List matching Reference Design */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {TERMS_SECTIONS.map((section) => {
            const isExpanded = expandedId === section.id;
            return (
              <div
                key={section.id}
                className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-gray-300"
              >
                {/* Accordion Header */}
                <button
                  id={`terms-btn-${section.id}`}
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                  aria-expanded={isExpanded}
                  aria-controls={`terms-panel-${section.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-brand-navy">
                      {section.id}. {section.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-brand-orange" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div
                    id={`terms-panel-${section.id}`}
                    role="region"
                    aria-labelledby={`terms-btn-${section.id}`}
                    className="px-6 pb-5 pt-1 border-t border-brand-border/60 bg-brand-warm-bg/30 space-y-2"
                  >
                    {section.content.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-xs sm:text-sm text-secondary-text leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
