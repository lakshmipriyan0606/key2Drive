"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  Clock,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import { toast } from "sonner";
import { CONTACT_DETAILS } from "@/lib/constants/navigation";
import { SEED_SERVICES } from "@/lib/data/seedData";

interface ServiceOption {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  priceUnit: string;
}

export default function HomepageBookingForm() {
  const [services, setServices] = useState<ServiceOption[]>(SEED_SERVICES as any);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    SEED_SERVICES[0]?.id || "srv-hourly-01"
  );
  const [duration, setDuration] = useState<string>("4 hours");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [dropAddress, setDropAddress] = useState<string>("");
  const [carMake, setCarMake] = useState<string>("Maruti Suzuki");
  const [carModel, setCarModel] = useState<string>("Swift");
  const [transmission, setTransmission] = useState<"MANUAL" | "AUTOMATIC">("MANUAL");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionHash, setSubmissionHash] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    estimatedFare: number;
    pickupAddress: string;
    pickupDateTime: string;
    serviceName: string;
  } | null>(null);

  useEffect(() => {
    // Generate idempotency hash
    const hash =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `hash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSubmissionHash(hash);

    // Default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setPickupDate(dateStr);

    // Fetch live services if available
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const json = await res.json();
        if (json.success && Array.isArray(json.services) && json.services.length > 0) {
          setServices(json.services);
          setSelectedServiceId(json.services[0].id);
        }
      } catch {
        // Fallback to seed services
      }
    }
    fetchServices();
  }, []);

  const CORE_SERVICES = ["hourly-driver", "full-day-driver", "airport-transfer", "outstation-driver"];
  const displayServices = services.filter((s) => CORE_SERVICES.includes(s.slug)).length > 0
    ? services.filter((s) => CORE_SERVICES.includes(s.slug))
    : services.slice(0, 4);

  const handleSelectService = (svc: ServiceOption) => {
    setSelectedServiceId(svc.id);
    if (svc.slug?.includes("hourly")) setDuration("4 hours (Flexible city errands)");
    else if (svc.slug?.includes("full")) setDuration("8 hours (Full Day package)");
    else if (svc.slug?.includes("airport")) setDuration("Point-to-point Airport transfer");
    else if (svc.slug?.includes("outstation")) setDuration("Outstation highway travel");
    else setDuration("Acting Driver Service");
  };

  const selectedService = services.find((s) => s.id === selectedServiceId) || displayServices[0];

  const getDynamicWhatsAppUrl = (): string => {
    let msg = `Hello Key2Drive! 👋\nI would like to book a verified acting driver for my car.\n\n`;
    if (selectedService) {
      msg += `⏱️ Service: ${selectedService.title}\n`;
    }
    if (pickupDate && pickupTime) {
      msg += `📅 Pickup Date & Time: ${pickupDate} at ${pickupTime}\n`;
    }
    if (pickupAddress.trim()) {
      msg += `📍 Pickup Location: ${pickupAddress.trim()}\n`;
    }
    if (carMake.trim() || carModel.trim()) {
      msg += `🚗 Vehicle: ${carMake.trim()} ${carModel.trim()} (${transmission})\n`;
    }
    msg += `\nPlease share driver availability and quote. Thank you!`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(msg)}`;
  };

  const calculateFare = (): number => {
    if (!selectedService) return 600;
    const base = selectedService.basePrice;
    let multiplier = 1;
    if (duration.includes("8 hours")) multiplier = 1.8;
    if (duration.includes("12 hours")) multiplier = 2.5;
    if (duration.includes("Full Day")) multiplier = 2.2;
    return Math.round(base * multiplier);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!pickupDate) errs.pickupDate = "Select pickup date";
    if (!pickupTime) errs.pickupTime = "Select pickup time";
    if (!pickupAddress.trim() || pickupAddress.trim().length < 5) {
      errs.pickupAddress = "Enter full pickup address (min 5 characters)";
    }
    if (!carMake.trim()) errs.carMake = "Car make required";
    if (!carModel.trim()) errs.carModel = "Car model required";
    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = "Name must be at least 2 characters";
    }
    const cleanPhone = customerPhone.replace(/[\s\-\+]/g, "");
    if (!cleanPhone || !/^(?:91)?[6-9]\d{9}$/.test(cleanPhone)) {
      errs.customerPhone = "Enter a valid 10-digit mobile number";
    }
    if (
      !customerEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      errs.customerEmail = "Enter a valid email address";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the required booking fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/[\s\-]/g, ""),
        customerEmail: customerEmail.trim().toLowerCase(),
        serviceId: selectedServiceId,
        pickupAddress: pickupAddress.trim(),
        dropAddress: dropAddress.trim() || null,
        pickupDateTime: `${pickupDate}T${pickupTime}:00`,
        duration,
        vehicleInfo: {
          make: carMake.trim(),
          model: carModel.trim(),
          transmission,
        },
        specialInstructions: "Booked via Homepage Quick Booking Form",
        submissionHash,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit booking");
      }

      toast.success("Booking confirmed successfully!");
      setConfirmedBooking({
        reference: data.bookingReference,
        estimatedFare: data.estimatedFare || calculateFare(),
        pickupAddress: pickupAddress.trim(),
        pickupDateTime: `${pickupDate} at ${pickupTime}`,
        serviceName: selectedService.title,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit booking. Please try calling dispatch directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book-form" className="py-16 sm:py-24 bg-brand-warm-bg relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast 60-Second Booking</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Book an Acting Driver for Your Car
          </h2>

          <p className="text-secondary-text text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Professional doorstep driver dispatch. Skilled drivers for manual, automatic, and luxury vehicles.
          </p>
        </div>

        {/* 3-Way Booking Channels Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-brand-border shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs font-bold uppercase text-brand-orange block tracking-wider">
                Need a Driver Instantly?
              </span>
              <p className="text-xs sm:text-sm font-semibold text-brand-navy">
                You can Call directly, WhatsApp dispatch, or fill the form below:
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-brand-orange text-xs font-bold hover:bg-amber-500/25 shadow-sm transition-transform active:scale-95"
                title="Call Now for Instant Driver Dispatch"
              >
                <Phone className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                <span>Call Now: <span className="text-brand-navy font-black">{CONTACT_DETAILS.phoneDisplay}</span></span>
              </a>

              <a
                href={getDynamicWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Booking</span>
              </a>
            </div>
          </div>
        </div>

        {/* Confirmed Booking State */}
        {confirmedBooking ? (
          <div className="bg-white rounded-3xl border border-emerald-300 shadow-2xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Booking Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
                Your Acting Driver Request is Registered!
              </h3>
              <p className="text-sm text-secondary-text max-w-md mx-auto">
                Our operations desk will assign your verified driver and send confirmation via SMS and phone.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-brand-warm-bg rounded-2xl p-5 border border-brand-border text-left space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-secondary-text">Booking Reference</span>
                <span className="font-mono font-bold text-brand-navy">{confirmedBooking.reference}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-secondary-text">Service</span>
                <span className="font-bold text-brand-navy">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-secondary-text">Pickup Schedule</span>
                <span className="font-bold text-brand-navy">{confirmedBooking.pickupDateTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Trip Charges</span>
                <span className="font-bold text-brand-orange text-xs sm:text-sm">Discussed & Confirmed on Call / WhatsApp</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  `Hello Key2Drive! 👋\nI have submitted booking reference: ${confirmedBooking.reference}.\n\n• Service: ${confirmedBooking.serviceName}\n• Schedule: ${confirmedBooking.pickupDateTime}\n\nPlease confirm driver assignment and ETA. Thank you!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </a>

              <a
                href={`tel:${CONTACT_DETAILS.phoneTel}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/15 border border-amber-500/30 text-brand-orange text-xs font-bold hover:bg-amber-500/25 transition-colors"
                title="Call Operations"
              >
                <Phone className="w-4 h-4 text-brand-orange" />
                <span>Call Now: {CONTACT_DETAILS.phoneDisplay}</span>
              </a>

              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="px-6 py-3 rounded-full bg-brand-warm-bg hover:bg-gray-200 text-brand-navy text-xs font-bold border border-brand-border transition-colors"
              >
                Book Another Trip
              </button>
            </div>
          </div>
        ) : (
          /* The Interactive Booking Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-brand-border shadow-xl p-6 sm:p-10 space-y-8"
          >
            {/* 1. Service Selection Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                1. Select Service Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {displayServices.map((svc) => {
                  const isSelected = svc.id === selectedServiceId;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => handleSelectService(svc)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? "bg-brand-navy text-white border-brand-navy shadow-md ring-2 ring-brand-orange/40"
                          : "bg-white text-brand-navy border-brand-border hover:border-brand-orange/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Car className={`w-4 h-4 ${isSelected ? "text-brand-orange" : "text-secondary-text"}`} />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-amber-50 text-brand-orange border border-amber-200/60"
                        }`}>
                          {svc.slug?.includes("hourly")
                            ? "Hourly"
                            : svc.slug?.includes("full")
                            ? "Full Day"
                            : svc.slug?.includes("airport")
                            ? "Airport"
                            : "Outstation"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-xs block leading-tight">{svc.title}</span>
                        <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-white/70" : "text-secondary-text"}`}>
                          {svc.slug?.includes("hourly")
                            ? "Flexible city trips"
                            : svc.slug?.includes("full")
                            ? "8 hrs / 80 km package"
                            : svc.slug?.includes("airport")
                            ? "Terminal drop & pickup"
                            : "Intercity highway travel"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Pickup Schedule (Clean 2-Column Schedule, No Redundant Dropdown) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                2. Pickup Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-secondary-text mb-1">Pickup Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                  </div>
                  {errors.pickupDate && <p className="text-[11px] text-red-600 mt-1">{errors.pickupDate}</p>}
                </div>

                <div>
                  <label className="block text-xs text-secondary-text mb-1">Pickup Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                  </div>
                  {errors.pickupTime && <p className="text-[11px] text-red-600 mt-1">{errors.pickupTime}</p>}
                </div>
              </div>
            </div>

            {/* 3. Pickup Location & Vehicle Info */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                3. Pickup Location & Your Car Details
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-secondary-text mb-1">Pickup Address & Landmark</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. 100 Feet Rd, Indiranagar, Bangalore"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                  </div>
                  {errors.pickupAddress && <p className="text-[11px] text-red-600 mt-1">{errors.pickupAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs text-secondary-text mb-1">Destination / Drop Location (Optional)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Airport Terminal / City Center"
                      value={dropAddress}
                      onChange={(e) => setDropAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs text-secondary-text mb-1">Car Make</label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti, Hyundai, Toyota"
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                  />
                  {errors.carMake && <p className="text-[11px] text-red-600 mt-1">{errors.carMake}</p>}
                </div>

                <div>
                  <label className="block text-xs text-secondary-text mb-1">Car Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Swift, Innova, Creta, City"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                  />
                  {errors.carModel && <p className="text-[11px] text-red-600 mt-1">{errors.carModel}</p>}
                </div>

                <div>
                  <label className="block text-xs text-secondary-text mb-1">Transmission</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransmission("MANUAL")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        transmission === "MANUAL"
                          ? "bg-brand-navy text-white border-brand-navy"
                          : "bg-white text-secondary-text border-brand-border"
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransmission("AUTOMATIC")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        transmission === "AUTOMATIC"
                          ? "bg-brand-navy text-white border-brand-navy"
                          : "bg-white text-secondary-text border-brand-border"
                      }`}
                    >
                      Automatic
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Customer Contact Details */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                4. Your Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-secondary-text mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                  </div>
                  {errors.customerName && <p className="text-[11px] text-red-600 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-xs text-secondary-text mb-1">10-Digit Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                  </div>
                  {errors.customerPhone && <p className="text-[11px] text-red-600 mt-1">{errors.customerPhone}</p>}
                </div>

                <div>
                  <label className="block text-xs text-secondary-text mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. rajesh@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                  </div>
                  {errors.customerEmail && <p className="text-[11px] text-red-600 mt-1">{errors.customerEmail}</p>}
                </div>
              </div>
            </div>

            {/* 5. Summary & Instant Confirmation Button */}
            <div className="p-5 rounded-2xl bg-brand-warm-bg border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary-text">Pricing:</span>
                  <span className="text-base sm:text-lg font-black text-brand-navy">
                    Custom Quote on Call / WhatsApp
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-secondary-text">
                    Best rates discussed upfront with dispatch • Zero hidden fees • Pay after trip
                  </span>
                </div>
              </div>

              <ButtonMotion
                type="submit"
                variant="accent"
                size="lg"
                disabled={isSubmitting}
                className="!px-8 !py-3.5 !rounded-full shadow-lg font-bold text-sm w-full sm:w-auto"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                {isSubmitting ? "Confirming..." : "Book Driver Now"}
              </ButtonMotion>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

