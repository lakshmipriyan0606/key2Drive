"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Car,
  Calendar,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  PhoneCall,
  Star,
  Plane,
  Compass,
  MapPin,
  Check,
  MessageSquare,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import HeroVideoPlayer from "@/components/ui/HeroVideoPlayer";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { CONTACT_DETAILS, getServiceWhatsAppUrl } from "@/lib/constants/navigation";

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const services = [
    {
      id: "hourly",
      title: "Hourly Driver",
      tagline: "For city traffic, shopping & errands",
      description: "Convenient hourly acting driver to drive your personal car with zero parking or traffic stress.",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop",
      slug: "hourly-driver",
    },
    {
      id: "full-day",
      title: "Full Day Driver",
      tagline: "8 hrs / 80 km for office & family",
      description: "Dedicated personal driver for your entire day with unlimited city stops across the city.",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop",
      slug: "full-day-driver",
    },
    {
      id: "airport",
      title: "Airport Transfers",
      tagline: "Punctual terminal drops & pickups",
      description: "On-time doorstep pickup and airport terminal transfer with flight tracking.",
      image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop",
      slug: "airport-transfer",
    },
    {
      id: "outstation",
      title: "Outstation Trips",
      tagline: "Safe highway & weekend road trips",
      description: "Experienced long-distance driver for weekend getaways and intercity highway travel.",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
      slug: "outstation-driver",
    },
  ];

  const faqs = [
    {
      question: "How does the acting driver service work?",
      answer:
        "Key2Drive provides background-verified, professional drivers to drive your personal or company car. You simply book online with your pickup location, date, and vehicle details, or call/WhatsApp us directly, and our vetted driver arrives at your doorstep ready to drive.",
    },
    {
      question: "Are your drivers background-verified and experienced?",
      answer:
        "Yes, 100%. Every Key2Drive driver undergoes rigorous identity verification, government driving license authenticity validation, residential address verification, and hands-on driving evaluations across both manual and automatic transmissions.",
    },
    {
      question: "How is pricing decided for my booking?",
      answer:
        "We discuss and confirm the exact trip charges upfront when you contact our dispatch team or submit your booking request. Rates depend on your travel route, duration, and vehicle type, with complete transparency and zero hidden fees.",
    },
    {
      question: "What happens if I need to extend my booking duration?",
      answer:
        "You can easily extend your booking with your assigned driver or by contacting dispatch. Additional hours are charged at the transparent nominal hourly rate configured for your service without penalty.",
    },
    {
      question: "Can I book a driver for outstation or overnight road trips?",
      answer:
        "Absolutely. Our outstation drivers are experienced with national highway driving, night navigation, toll plazas, and multi-day travel. A transparent outstation daily driver allowance applies for meals and overnight stay.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-warm-bg">
      {/* 1. CINEMATIC HERO SECTION (Authentic Indian Acting Driver Service) */}
      <section className="relative overflow-hidden bg-brand-navy text-white pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-28">
        <div
          className="absolute inset-0 bg-radial-[at_top_right] from-brand-navy-deep/90 via-brand-navy to-brand-navy pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & 3-Way Booking Options */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-brand-orange text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Professional Acting Driver & Call Driver Services</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] text-balance">
                Need an Acting Driver <br />
                <span className="text-brand-orange">for Your Car?</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-xl leading-relaxed">
                Your trusted travel partner for a smooth, safe and comfortable journey. Experienced, background-checked acting drivers for city commutes, late-night party returns, airport transfers, and outstation trips.
              </p>

              {/* Clean Primary Hero CTAs (No Duplicates) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <Link href="/book" className="w-full sm:w-auto">
                  <ButtonMotion
                    variant="accent"
                    size="lg"
                    className="w-full sm:w-auto !px-8 !py-3.5 sm:!py-4 !rounded-full text-sm font-bold shadow-xl justify-center"
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />}
                  >
                    Book a Driver
                  </ButtonMotion>
                </Link>

                <Link href="/services" className="w-full sm:w-auto">
                  <ButtonMotion
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto !px-7 !py-3.5 sm:!py-4 !rounded-full !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 text-sm font-semibold justify-center"
                  >
                    Explore Services
                  </ButtonMotion>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual with Indian Driver & Vehicle Context */}
            <div className="lg:col-span-6 relative">
              <HeroVideoPlayer />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING QUICK TRUST FEATURE STRIP */}
      <section className="-mt-6 sm:-mt-8 relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl lg:rounded-full border border-brand-border shadow-xl p-4 sm:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:divide-x lg:divide-brand-border">
            <div className="flex items-center gap-3 px-2 justify-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-50 text-brand-orange flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </div>
              <div className="text-left min-w-0">
                <span className="font-bold text-xs sm:text-sm text-brand-navy block truncate">Professional Drivers</span>
                <span className="text-[11px] text-secondary-text hidden sm:block truncate">Govt ID & DL Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 justify-start lg:pl-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-50 text-brand-orange flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </div>
              <div className="text-left min-w-0">
                <span className="font-bold text-xs sm:text-sm text-brand-navy block truncate">24/7 Support</span>
                <span className="text-[11px] text-secondary-text hidden sm:block truncate">Always on call</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 justify-start lg:pl-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-50 text-brand-orange flex items-center justify-center shrink-0">
                <Car className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </div>
              <div className="text-left min-w-0">
                <span className="font-bold text-xs sm:text-sm text-brand-navy block truncate">Safe & Reliable</span>
                <span className="text-[11px] text-secondary-text hidden sm:block truncate">Experienced handling</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 justify-start lg:pl-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-50 text-brand-orange flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </div>
              <div className="text-left min-w-0">
                <span className="font-bold text-xs sm:text-sm text-brand-navy block truncate">Transparent Billing</span>
                <span className="text-[11px] text-secondary-text hidden sm:block truncate">Discussed with dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SERVICES SECTION WITH INDIAN CONTEXT IMAGES */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight text-balance">
              Our Services
            </h2>
            <p className="text-secondary-text text-sm sm:text-base">
              Choose from our professional acting driver and car driver services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm hover:shadow-lg transition-[box-shadow,border-color,transform] duration-300 hover:border-brand-orange/40 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with hover zoom */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2 text-left">
                    <h3 className="font-bold text-lg text-brand-navy">{svc.title}</h3>
                    <p className="text-xs font-semibold text-brand-orange">{svc.tagline}</p>
                    <p className="text-xs text-secondary-text leading-relaxed">{svc.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-brand-border/40">
                  <Link
                    href={`/book?service=${svc.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-orange transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange rounded"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>

                  <a
                    href={getServiceWhatsAppUrl(svc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] px-3.5 py-1.5 rounded-full shadow-xs transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    title={`Chat on WhatsApp for ${svc.title}`}
                    aria-label={`Chat on WhatsApp for ${svc.title}`}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <ButtonMotion variant="accent" size="md" className="!rounded-full px-6">
                View All Services & Inclusions
              </ButtonMotion>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. "WHY CHOOSE KEY2DRIVE?" BANNER (Exact Client Reference Design) */}
      <section id="why-us" className="py-12 sm:py-16 bg-white border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-brand-navy text-white overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                The Luxury Distinction
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Why Choose Key2Drive?
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Experience the difference with our professional acting driver service. We do not treat driving as casual gig work—every driver is a trained, polite professional dedicated to your safety.
              </p>

              {/* Checklist from Reference Design (Govt ID & DL Verified) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 font-bold" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    Professional & Verified Drivers (Govt ID & DL verified)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 font-bold" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    Transparent Pricing, No Hidden Cost (Strict zero surge policy)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 font-bold" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    Manual, Automatic & Luxury Vehicle Competence
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/book">
                  <ButtonMotion
                    variant="accent"
                    size="lg"
                    className="!rounded-full !px-8 shadow-lg font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />}
                  >
                    Book Now
                  </ButtonMotion>
                </Link>
              </div>
            </div>

            {/* Right Photo: Professional Verified Indian Driver opening car door */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full relative min-h-[360px]">
              <img
                src="/images/chauffeur-indian.jpg"
                alt="Professional Verified Indian Acting Driver opening car door"
                width={600}
                height={400}
                className="w-full h-full object-cover object-top sm:object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-transparent to-transparent lg:block hidden" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>


      {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-16 sm:py-24 bg-white border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight text-balance">
              Frequently Asked Questions
            </h2>
            <p className="text-secondary-text text-sm sm:text-base">
              Clear answers regarding bookings, safety protocols, and driver allocation.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className="border border-brand-border rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    id={`faq-btn-${index}`}
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left bg-brand-warm-bg/40 hover:bg-brand-warm-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="font-bold text-brand-navy text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-secondary-text shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-brand-orange" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-btn-${index}`}
                      className="p-5 pt-3 bg-white text-xs sm:text-sm text-secondary-text leading-relaxed border-t border-brand-border/60"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION BANNER */}
      <section className="py-16 bg-brand-navy text-white text-center space-y-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Experience First-Class Driving Comfort Today
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Whether for your daily city commute, a late dinner, or an early morning flight, let our professional acting drivers take the wheel.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/book">
              <ButtonMotion
                variant="accent"
                size="lg"
                className="!rounded-full !px-8 shadow-xl font-bold"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />}
              >
                Book a Driver Now
              </ButtonMotion>
            </Link>

            <a
              href={`tel:${CONTACT_DETAILS.phoneTel}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-white text-sm font-bold border border-amber-400/40 shadow-lg transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange tabular-nums"
              title="Call Now for Instant Driver Dispatch"
              aria-label={`Call dispatch at ${CONTACT_DETAILS.phoneDisplay}`}
            >
              <Phone className="w-4 h-4 text-brand-orange animate-pulse" aria-hidden="true" />
              <span>Call Now: <span translate="no">{CONTACT_DETAILS.phoneDisplay}</span></span>
            </a>

            <a
              href={CONTACT_DETAILS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-extrabold shadow-lg transition-[background-color,transform] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Chat on WhatsApp"
              aria-label="WhatsApp Booking with greeting"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp</span>
            </a>

            <Link href="/contact">
              <ButtonMotion
                variant="secondary"
                size="lg"
                className="!rounded-full !px-8 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
              >
                Contact Dispatch
              </ButtonMotion>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
