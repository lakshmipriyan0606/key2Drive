"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import CustomSelect, { CustomSelectOption } from "@/components/ui/CustomSelect";
import { SEED_SERVICES, SEED_TARIFFS } from "@/lib/data/seedData";

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  priceUnit: string;
}

interface TariffItem {
  id: string;
  title: string;
  baseRate: number;
  serviceId: string;
}

const STEPS = [
  { step: 1, title: "Service & Timing", desc: "Choose your service" },
  { step: 2, title: "Journey Details", desc: "Pickup & Destination" },
  { step: 3, title: "Customer Details", desc: "Your information" },
  { step: 4, title: "Confirm Booking", desc: "Review & Submit" },
];

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const preselectedTariff = searchParams.get("tariff") || "";

  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<ServiceItem[]>(SEED_SERVICES as any);
  const [tariffs, setTariffs] = useState<TariffItem[]>(SEED_TARIFFS as any);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    serviceId: preselectedService || SEED_SERVICES[0].id,
    tariffId: preselectedTariff || SEED_TARIFFS[0].id,
    pickupDate: "",
    pickupTime: "10:00",
    duration: "4 hours",
    pickupAddress: "",
    dropAddress: "",
    vehicleMake: "",
    vehicleModel: "",
    transmission: "AUTOMATIC" as "AUTOMATIC" | "MANUAL",
    vehicleCategory: "SEDAN",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    specialInstructions: "",
    submissionHash: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    id: string;
    status: string;
    estimatedFare: number;
    pickupAddress: string;
    dropAddress?: string;
    pickupDateTime: string;
    serviceName: string;
    customerName: string;
    customerPhone: string;
    vehicleMake: string;
    vehicleModel: string;
  } | null>(null);

  // Initialize submission hash for idempotency protection
  useEffect(() => {
    const hash =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `hash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setFormData((prev) => ({ ...prev, submissionHash: hash }));

    // Default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, pickupDate: dateStr }));
  }, []);

  // Fetch available services & tariffs
  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, tariffsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/tariffs"),
        ]);
        const sJson = await servicesRes.json();
        const tJson = await tariffsRes.json();

        if (sJson.success && Array.isArray(sJson.services)) {
          setServices(sJson.services);
          if (preselectedService) {
            const found = sJson.services.find(
              (s: ServiceItem) => s.slug === preselectedService || s.id === preselectedService
            );
            if (found) {
              setFormData((prev) => ({ ...prev, serviceId: found.id }));
            }
          } else if (sJson.services.length > 0) {
            setFormData((prev) => ({ ...prev, serviceId: sJson.services[0].id }));
          }
        }

        if (tJson.success && Array.isArray(tJson.tariffs)) {
          setTariffs(tJson.tariffs);
          if (preselectedTariff) {
            setFormData((prev) => ({ ...prev, tariffId: preselectedTariff }));
          }
        }
      } catch (err) {
        console.error("Failed to load booking dependencies", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [preselectedService, preselectedTariff]);

  const selectedService = services.find((s) => s.id === formData.serviceId);

  // Calculated estimated fare
  const calculateEstimatedFare = (): number => {
    if (!selectedService) return 600;
    const base = selectedService.basePrice;
    let multiplier = 1;
    if (formData.duration.includes("8 hours")) multiplier = 1.8;
    if (formData.duration.includes("12 hours")) multiplier = 2.5;
    if (formData.duration.includes("Full Day")) multiplier = 2.2;
    return Math.round(base * multiplier);
  };

  // Luxury CustomSelect option structures
  const serviceOptions: CustomSelectOption[] = services.map((svc) => ({
    value: svc.id,
    label: svc.title,
    badge: "Custom Quote",
    description: "Discussed with dispatch",
    icon: <Car className="w-4 h-4" />,
  }));

  const durationOptions: CustomSelectOption[] = [
    {
      value: "4 hours",
      label: "Standard 4 Hours",
      badge: "Popular",
      description: "City rides, shopping, dining, and meetings",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      value: "8 hours",
      label: "Full Day 8 Hours",
      badge: "Best Value",
      description: "80 km package for uninterrupted all-day travel",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      value: "12 hours",
      label: "Extended 12 Hours",
      badge: "Long Duty",
      description: "Outstation routes, events, and late-night returns",
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  const transmissionOptions: CustomSelectOption[] = [
    {
      value: "AUTOMATIC",
      label: "Automatic",
      description: "Torque converter, CVT, DSG, DCT, or EV",
    },
    {
      value: "MANUAL",
      label: "Manual",
      description: "5 or 6-speed stick-shift certified chauffeur",
    },
  ];

  const categoryOptions: CustomSelectOption[] = [
    { value: "SEDAN", label: "Sedan", description: "City, Ciaz, Verna, Camry, Accord" },
    { value: "SUV", label: "SUV / MPV", description: "Creta, Innova, Fortuner, Safari" },
    { value: "HATCHBACK", label: "Hatchback", description: "Swift, Baleno, i20, Polo, Altroz" },
    {
      value: "LUXURY",
      label: "Luxury Fleet",
      badge: "Executive",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Mercedes, BMW, Audi, Jaguar, Range Rover",
    },
  ];

  // Validation routines per step
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.serviceId) errs.serviceId = "Please select a service tier";
    if (!formData.pickupDate) errs.pickupDate = "Please choose a pickup date";
    if (!formData.pickupTime) errs.pickupTime = "Please specify pickup time";

    if (formData.pickupDate && formData.pickupTime) {
      const selected = new Date(`${formData.pickupDate}T${formData.pickupTime}:00`);
      if (isNaN(selected.getTime()) || selected.getTime() <= Date.now()) {
        errs.pickupDate = "Pickup time must be in the future";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.pickupAddress || formData.pickupAddress.trim().length < 5) {
      errs.pickupAddress = "Pickup address must be at least 5 characters";
    }
    if (!formData.vehicleMake || formData.vehicleMake.trim().length < 2) {
      errs.vehicleMake = "Car make is required (e.g. Honda, BMW, Hyundai)";
    }
    if (!formData.vehicleModel || formData.vehicleModel.trim().length < 1) {
      errs.vehicleModel = "Car model is required (e.g. City, 3 Series, Creta)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.customerName || formData.customerName.trim().length < 2) {
      errs.customerName = "Full name is required (min 2 characters)";
    }
    const cleanPhone = formData.customerPhone.replace(/[\s\-\+]/g, "");
    if (!cleanPhone || !/^(?:91)?[6-9]\d{9}$/.test(cleanPhone)) {
      errs.customerPhone = "Enter a valid 10-digit mobile number (e.g. 9600992709)";
    }
    if (
      !formData.customerEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim())
    ) {
      errs.customerEmail = "Enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (validateStep3()) setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Submit Final Booking
  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error("Please complete all required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceId: formData.serviceId,
        tariffId: formData.tariffId || undefined,
        pickupDateTime: `${formData.pickupDate}T${formData.pickupTime}:00.000Z`,
        durationHours: formData.duration.includes("8")
          ? 8
          : formData.duration.includes("12")
          ? 12
          : 4,
        pickupAddress: formData.pickupAddress.trim(),
        dropAddress: formData.dropAddress.trim() || undefined,
        vehicleMake: formData.vehicleMake.trim(),
        vehicleModel: formData.vehicleModel.trim(),
        transmission: formData.transmission,
        vehicleCategory: formData.vehicleCategory,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.replace(/[\s\-]/g, ""),
        customerEmail: formData.customerEmail.trim().toLowerCase(),
        specialInstructions: formData.specialInstructions.trim() || undefined,
        estimatedAmount: calculateEstimatedFare(),
        submissionHash: formData.submissionHash,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create chauffeur booking.");
      }

      setConfirmedBooking({
        reference: data.booking.reference,
        id: data.booking.id,
        status: data.booking.status,
        estimatedFare: data.booking.estimatedAmount,
        pickupAddress: data.booking.pickupAddress,
        dropAddress: data.booking.dropAddress,
        pickupDateTime: data.booking.pickupDateTime,
        serviceName: selectedService?.title || "Chauffeur Service",
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
      });

      toast.success("Booking placed successfully!");
      setStep(5); // Show Confirmation View
    } catch (err: any) {
      toast.error(err.message || "Something went wrong while booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-brand-warm-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-brand-orange border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-brand-navy">Initializing Booking Portal...</span>
        </div>
      </div>
    );
  }

  // CONFIRMATION VIEW (Matching Reference Design: "Booking Confirmation")
  if (step === 5 && confirmedBooking) {
    return (
      <div className="min-h-screen bg-brand-warm-bg py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-brand-border p-8 sm:p-12 shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Confetti Dots Decor */}
          <div className="absolute top-4 left-6 w-2.5 h-2.5 rounded-full bg-brand-orange/40" />
          <div className="absolute top-12 left-16 w-2 h-2 rounded-full bg-emerald-400/50" />
          <div className="absolute top-6 right-10 w-3 h-3 rounded-full bg-blue-400/40" />
          <div className="absolute top-16 right-20 w-2 h-2 rounded-full bg-brand-orange/50" />

          {/* Large Green Checkmark Badge matching reference design */}
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              Booking Confirmed!
            </h1>
            <p className="text-secondary-text text-sm sm:text-base">
              Your booking has been successfully submitted.
            </p>
          </div>

          {/* Booking Reference Box matching reference design */}
          <div className="p-4 rounded-xl bg-brand-warm-bg border border-brand-border max-w-sm mx-auto">
            <div className="text-xs font-semibold text-secondary-text">Booking Reference</div>
            <div className="text-lg font-mono font-bold text-brand-navy mt-1 tracking-wide">
              {confirmedBooking.reference}
            </div>
          </div>

          {/* Action Buttons matching reference design */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-orange text-white font-bold text-sm hover:bg-[#d97d00] transition-colors shadow-sm"
            >
              View Booking Details
            </button>
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-brand-border text-brand-navy font-bold text-sm hover:bg-gray-50 transition-colors">
                Back to Home
              </button>
            </Link>
          </div>

          {/* SMS Notice */}
          <p className="text-xs text-secondary-text pt-2">
            * You will receive a confirmation SMS shortly
          </p>
        </div>

        {/* Modal for Details */}
        {showDetailsModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-trip-details-title"
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overscroll-contain"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 id="modal-trip-details-title" className="font-bold text-base text-brand-navy">Trip Details</h3>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                  aria-label="Close trip details modal"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-xs text-secondary-text tabular-nums">
                <div className="flex justify-between py-1 border-b">
                  <span>Reference:</span>
                  <span className="font-mono font-bold text-brand-navy">{confirmedBooking.reference}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Service:</span>
                  <span className="font-bold text-brand-navy">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Customer:</span>
                  <span className="font-medium text-brand-navy">{confirmedBooking.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Phone:</span>
                  <span className="font-medium text-brand-navy">{confirmedBooking.customerPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Vehicle:</span>
                  <span className="font-medium text-brand-navy">
                    {confirmedBooking.vehicleMake} {confirmedBooking.vehicleModel}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Trip Fare:</span>
                  <span className="font-bold text-brand-orange">
                    Discussed on Call / WhatsApp
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Pickup Location:</span>
                  <span className="font-medium text-brand-navy text-right max-w-[200px] truncate">
                    {confirmedBooking.pickupAddress}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3-COLUMN BOOKING WIZARD (Matching Reference Design: "Booking Page")
  return (
    <div className="min-h-screen bg-brand-warm-bg py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Vertical Stepper matching reference design */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-brand-border p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text">
              Booking Steps
            </h3>
            <div className="space-y-6" role="list">
              {STEPS.map((s) => {
                const isActive = step === s.step;
                const isPassed = step > s.step;

                return (
                  <div key={s.step} className="flex items-start gap-3" role="listitem" aria-current={isActive ? "step" : undefined}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isActive
                          ? "bg-brand-orange text-white ring-4 ring-brand-orange/20"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "border border-gray-300 text-gray-400 bg-white"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : s.step}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isActive ? "text-brand-navy" : "text-gray-500"
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="text-[11px] text-secondary-text mt-0.5 leading-snug">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER COLUMN: Main Form Card matching reference design */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-brand-border p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-brand-navy tracking-tight text-balance">
                Book Your Driver
              </h1>
              <p className="text-xs text-secondary-text mt-1">
                Quick and easy booking process
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: SERVICE & TIMING */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-5"
                >
                  <CustomSelect
                    label="Select Service"
                    required
                    options={serviceOptions}
                    value={formData.serviceId}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceId: val,
                        tariffId: "",
                      }))
                    }
                    error={errors.serviceId}
                    placeholder="Choose chauffeur service tier…"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="bk-pickup-date" className="block text-xs font-bold text-brand-navy">
                        Pickup Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="bk-pickup-date"
                          name="pickupDate"
                          type="date"
                          value={formData.pickupDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, pickupDate: e.target.value }))
                          }
                          aria-invalid={!!errors.pickupDate}
                          aria-describedby={errors.pickupDate ? "bk-pickupDate-error" : undefined}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm font-medium"
                        />
                      </div>
                      {errors.pickupDate && (
                        <p id="bk-pickupDate-error" className="text-xs text-red-600 mt-1" role="alert">
                          {errors.pickupDate}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="bk-pickup-time" className="block text-xs font-bold text-brand-navy">
                        Pickup Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="bk-pickup-time"
                          name="pickupTime"
                          type="time"
                          value={formData.pickupTime}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, pickupTime: e.target.value }))
                          }
                          aria-invalid={!!errors.pickupTime}
                          aria-describedby={errors.pickupTime ? "bk-pickupTime-error" : undefined}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm font-medium"
                        />
                      </div>
                      {errors.pickupTime && (
                        <p id="bk-pickupTime-error" className="text-xs text-red-600 mt-1" role="alert">
                          {errors.pickupTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <CustomSelect
                    label="Estimated Duration"
                    options={durationOptions}
                    value={formData.duration}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, duration: val }))
                    }
                    placeholder="Choose duration…"
                  />

                  <div className="pt-2">
                    <ButtonMotion
                      variant="accent"
                      size="md"
                      onClick={handleNextStep}
                      className="w-full justify-center !rounded-xl font-bold shadow-sm"
                      rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />}
                    >
                      Continue to Next Step
                    </ButtonMotion>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: JOURNEY & VEHICLE DETAILS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="bk-pickup-address" className="block text-xs font-bold text-brand-navy">
                      Pickup Address / Landmark <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bk-pickup-address"
                      name="pickupAddress"
                      type="text"
                      autoComplete="street-address"
                      placeholder="e.g. Saai Avenue, New Perungalathur, Chennai…"
                      value={formData.pickupAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pickupAddress: e.target.value }))
                      }
                      aria-invalid={!!errors.pickupAddress}
                      aria-describedby={errors.pickupAddress ? "bk-pickupAddress-error" : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm font-medium"
                    />
                    {errors.pickupAddress && (
                      <p id="bk-pickupAddress-error" className="text-xs text-red-600 mt-1" role="alert">
                        {errors.pickupAddress}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bk-drop-address" className="block text-xs font-bold text-brand-navy">
                      Destination / Drop Address (Optional)
                    </label>
                    <input
                      id="bk-drop-address"
                      name="dropAddress"
                      type="text"
                      autoComplete="street-address"
                      placeholder="e.g. Kempegowda International Airport or Multi-stop…"
                      value={formData.dropAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, dropAddress: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="bk-vehicle-make" className="block text-xs font-bold text-brand-navy">
                        Car Make <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="bk-vehicle-make"
                        name="vehicleMake"
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="e.g. Honda, BMW…"
                        value={formData.vehicleMake}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, vehicleMake: e.target.value }))
                        }
                        aria-invalid={!!errors.vehicleMake}
                        aria-describedby={errors.vehicleMake ? "bk-vehicleMake-error" : undefined}
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm"
                      />
                      {errors.vehicleMake && (
                        <p id="bk-vehicleMake-error" className="text-xs text-red-600 mt-1" role="alert">
                          {errors.vehicleMake}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="bk-vehicle-model" className="block text-xs font-bold text-brand-navy">
                        Car Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="bk-vehicle-model"
                        name="vehicleModel"
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="e.g. City, 3 Series…"
                        value={formData.vehicleModel}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, vehicleModel: e.target.value }))
                        }
                        aria-invalid={!!errors.vehicleModel}
                        aria-describedby={errors.vehicleModel ? "bk-vehicleModel-error" : undefined}
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm"
                      />
                      {errors.vehicleModel && (
                        <p id="bk-vehicleModel-error" className="text-xs text-red-600 mt-1" role="alert">
                          {errors.vehicleModel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomSelect
                      label="Transmission"
                      options={transmissionOptions}
                      value={formData.transmission}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          transmission: val as "AUTOMATIC" | "MANUAL",
                        }))
                      }
                    />

                    <CustomSelect
                      label="Vehicle Category"
                      options={categoryOptions}
                      value={formData.vehicleCategory}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, vehicleCategory: val }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <ButtonMotion variant="secondary" size="md" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />}>
                      Back
                    </ButtonMotion>
                    <ButtonMotion variant="accent" size="md" onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />}>
                      Continue to Next Step
                    </ButtonMotion>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CUSTOMER DETAILS */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="bk-customer-name" className="block text-xs font-bold text-brand-navy">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bk-customer-name"
                      name="customerName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Ramesh Kumar…"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, customerName: e.target.value }))
                      }
                      aria-invalid={!!errors.customerName}
                      aria-describedby={errors.customerName ? "bk-customerName-error" : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm font-medium"
                    />
                    {errors.customerName && (
                      <p id="bk-customerName-error" className="text-xs text-red-600 mt-1" role="alert">
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bk-customer-phone" className="block text-xs font-bold text-brand-navy">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bk-customer-phone"
                      name="customerPhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="e.g. 9600992709"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))
                      }
                      aria-invalid={!!errors.customerPhone}
                      aria-describedby={errors.customerPhone ? "bk-customerPhone-error" : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm font-medium tabular-nums"
                    />
                    {errors.customerPhone && (
                      <p id="bk-customerPhone-error" className="text-xs text-red-600 mt-1" role="alert">
                        {errors.customerPhone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bk-customer-email" className="block text-xs font-bold text-brand-navy">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bk-customer-email"
                      name="customerEmail"
                      type="email"
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="e.g. ramesh@example.com"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))
                      }
                      aria-invalid={!!errors.customerEmail}
                      aria-describedby={errors.customerEmail ? "bk-customerEmail-error" : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-sm font-medium"
                    />
                    {errors.customerEmail && (
                      <p id="bk-customerEmail-error" className="text-xs text-red-600 mt-1" role="alert">
                        {errors.customerEmail}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bk-special-instructions" className="block text-xs font-bold text-brand-navy">
                      Special Notes (Optional)
                    </label>
                    <textarea
                      id="bk-special-instructions"
                      name="specialInstructions"
                      rows={2}
                      placeholder="e.g. Call 10 mins before arrival, preferred route…"
                      value={formData.specialInstructions}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, specialInstructions: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-brand-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <ButtonMotion variant="secondary" size="md" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />}>
                      Back
                    </ButtonMotion>
                    <ButtonMotion variant="accent" size="md" onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />}>
                      Review & Confirm
                    </ButtonMotion>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: CONFIRM & SUBMIT */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-5"
                >
                  <div className="p-4 rounded-xl bg-brand-warm-bg border border-brand-border space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-secondary-text">Service:</span>
                      <span className="font-bold text-brand-navy">{selectedService?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-text">Pickup Schedule:</span>
                      <span className="font-semibold text-brand-navy">
                        {formData.pickupDate} at {formData.pickupTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-text">Vehicle:</span>
                      <span className="font-semibold text-brand-navy">
                        {formData.vehicleMake} {formData.vehicleModel} ({formData.transmission})
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-brand-border/60 pt-2">
                      <span className="text-secondary-text font-bold">Trip Charges:</span>
                      <span className="font-bold text-brand-orange text-xs sm:text-sm">
                        Discussed on Call / WhatsApp
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-secondary-text leading-relaxed">
                    By confirming, you request a verified Key2Drive chauffeur. Payment is directly settled with the driver post-trip.
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <ButtonMotion
                      variant="secondary"
                      size="md"
                      onClick={handlePrevStep}
                      disabled={isSubmitting}
                      leftIcon={<ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />}
                    >
                      Back
                    </ButtonMotion>
                    <ButtonMotion
                      variant="accent"
                      size="md"
                      onClick={() => handleSubmitBooking()}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      rightIcon={<CheckCircle2 className="w-4 h-4 ml-1" aria-hidden="true" />}
                    >
                      {isSubmitting ? "Placing Booking…" : "Confirm Booking"}
                    </ButtonMotion>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Luxury Car Photo matching reference design */}
          <div className="lg:col-span-4 rounded-2xl overflow-hidden shadow-sm border border-brand-border hidden lg:block bg-brand-navy">
            <div className="relative aspect-[4/5] w-full">
              <img
                src="/images/chauffeur-indian.jpg"
                alt="Key2Drive Executive Luxury Chauffeur"
                width={400}
                height={500}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent opacity-80" aria-hidden="true" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider">
                  Guaranteed Comfort
                </span>
                <p className="font-bold text-sm text-white">Your Car, Our Professional Driver</p>
                <p className="text-xs text-white/70">Background-checked professional drivers with zero surge guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-warm-bg flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-3 border-brand-orange border-t-transparent animate-spin" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
