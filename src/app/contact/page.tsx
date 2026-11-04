"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import { CONTACT_DETAILS } from "@/lib/constants/navigation";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Chauffeur Booking Enquiry",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<{
    id: string;
    message: string;
    whatsappLink?: string;
  } | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters";
    }
    const cleanPhone = formData.phone.replace(/[\s\-\+]/g, "");
    if (!cleanPhone || !/^(?:91)?[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = "Enter a valid 10-digit mobile number";
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errs.email = "Enter a valid email address";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.replace(/[\s\-]/g, ""),
          email: formData.email.trim().toLowerCase(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      toast.success("Enquiry received! Our team will contact you shortly.");
      setSubmittedEnquiry({
        id: data.enquiryId,
        message: data.message,
        whatsappLink: data.whatsappLink,
      });

      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "Chauffeur Booking Enquiry",
        message: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-warm-bg py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Split Contact Card matching Reference Design */}
        <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Landmark Background with Contact Channels */}
          <div className="lg:col-span-5 relative text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden bg-brand-navy min-h-[460px]">
            {/* Background photo (city architecture) */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1000&auto=format&fit=crop"
                alt="Key2Drive Bangalore Headquarters"
                className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/90 to-brand-navy/80" />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Get in Touch
                </h1>
                <p className="text-white/80 text-sm">
                  We are here to help you 24/7
                </p>
              </div>

              {/* 4 Contact Rows matching reference design */}
              <div className="space-y-6 text-sm">
                {/* 1. Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-brand-orange border border-amber-500/30">
                    <Phone className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <a
                      href={`tel:${CONTACT_DETAILS.phoneTel}`}
                      className="font-black text-white hover:text-brand-orange transition-colors text-base block"
                      title="Tap to Call Now"
                    >
                      Call Now: {CONTACT_DETAILS.phoneDisplay}
                    </a>
                    <p className="text-xs text-brand-orange/90 font-medium">Click to Call (24/7 Dispatch Desk)</p>
                  </div>
                </div>

                {/* 2. WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 border border-emerald-500/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <a
                      href={CONTACT_DETAILS.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-black text-emerald-400 hover:text-emerald-300 transition-colors text-base block"
                      title="Chat on WhatsApp with Pre-filled Greeting"
                    >
                      WhatsApp Booking
                    </a>
                    <p className="text-xs text-white/70">Click to start with pre-filled greeting</p>
                  </div>
                </div>

                {/* 3. Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-brand-orange border border-white/10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <a
                      href={`mailto:${CONTACT_DETAILS.emailMailto}`}
                      className="font-bold text-white hover:text-brand-orange transition-colors"
                    >
                      info@key2drive.com
                    </a>
                    <p className="text-xs text-white/60">Drop us an email</p>
                  </div>
                </div>

                {/* 4. Office Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-brand-orange border border-white/10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Bengaluru, Karnataka</p>
                    <p className="text-xs text-white/60">Visit our office</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom notice */}
            <div className="relative z-10 pt-6 border-t border-white/10 mt-6 text-[11px] text-white/50">
              [Pending Client Review] Official helpline operating 24 hours daily.
            </div>
          </div>

          {/* Right Column: "Send us a Message" Form matching reference design */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-lg">
              <h2 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight mb-6">
                Send us a Message
              </h2>

              {submittedEnquiry ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-emerald-900">
                    Message Successfully Sent!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you. Your message reference is <b>#{submittedEnquiry.id.slice(0, 8)}</b>.
                    Our concierge team will respond within 30 minutes.
                  </p>
                  <button
                    onClick={() => setSubmittedEnquiry(null)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-navy">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-brand-navy">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600 mt-0.5">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-brand-navy">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="ramesh@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-navy">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your trip requirement, corporate inquiry, or chauffeur preferences..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                    />
                    {errors.message && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <ButtonMotion
                      variant="accent"
                      size="lg"
                      type="submit"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      className="w-full justify-center !rounded-xl font-bold shadow-md"
                      rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}
                    >
                      {isSubmitting ? "Sending Message..." : "Send Message"}
                    </ButtonMotion>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
