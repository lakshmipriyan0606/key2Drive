"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
}

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
  service?: {
    id: string;
    slug: string;
    title: string;
  };
}

const SERVICE_TABS = [
  { slug: "hourly-driver", label: "Hourly Driver" },
  { slug: "full-day-driver", label: "Full Day" },
  { slug: "airport-transfer", label: "Airport Transfer" },
  { slug: "outstation-driver", label: "Outstation" },
];

export default function AdminPricingPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>("hourly-driver");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [tariffs, setTariffs] = useState<TariffItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State for currently selected service
  const [formData, setFormData] = useState({
    baseRate: 150,
    minHours: 4,
    extraHour: 150,
    extraKm: 12,
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [sRes, tRes] = await Promise.all([
        fetch("/api/admin/pricing"),
        fetch("/api/admin/tariffs"),
      ]);
      const sData = await sRes.json();
      const tData = await tRes.json();

      if (sData?.success && Array.isArray(sData.services)) {
        setServices(sData.services);
      } else if (Array.isArray(sData)) {
        setServices(sData);
      } else {
        setServices([]);
      }

      if (tData?.success && Array.isArray(tData.tariffs)) {
        setTariffs(tData.tariffs);
      } else if (tData?.success && Array.isArray(tData.services)) {
        const flatTariffs = tData.services.flatMap((s: any) =>
          (s.tariffs || []).map((t: any) => ({ ...t, service: s }))
        );
        setTariffs(flatTariffs);
      } else if (Array.isArray(tData)) {
        setTariffs(tData);
      } else {
        setTariffs([]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load pricing data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update form data when tab or data changes
  useEffect(() => {
    const s = Array.isArray(services) ? services.find((item) => item?.slug === selectedSlug) : undefined;
    const t = Array.isArray(tariffs) ? tariffs.find((item) => item?.service?.slug === selectedSlug) : undefined;

    if (s || t) {
      setFormData({
        baseRate: s ? s.basePrice : t ? t.baseRate : 150,
        minHours: t?.includedHours || (selectedSlug === "full-day-driver" ? 8 : 4),
        extraHour: t?.extraHourRate || 150,
        extraKm: t?.extraKmRate || 12,
        isActive: s ? s.isActive : true,
      });
    }
  }, [selectedSlug, services, tariffs]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const s = Array.isArray(services) ? services.find((item) => item?.slug === selectedSlug) : undefined;
      const t = Array.isArray(tariffs) ? tariffs.find((item) => item?.service?.slug === selectedSlug) : undefined;

      const promises = [];

      // Update Service base price & active status
      if (s) {
        promises.push(
          fetch(`/api/admin/pricing/${s.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              basePrice: Number(formData.baseRate),
              isActive: Boolean(formData.isActive),
            }),
          })
        );
      }

      // Update Tariff extra hour, extra km, base rate
      if (t) {
        promises.push(
          fetch(`/api/admin/tariffs/${t.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              baseRate: Number(formData.baseRate),
              includedHours: Number(formData.minHours),
              extraHourRate: Number(formData.extraHour),
              extraKmRate: Number(formData.extraKm),
            }),
          })
        );
      }

      await Promise.all(promises);
      toast.success("Pricing configurations saved successfully.");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save pricing changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const s = Array.isArray(services) ? services.find((item) => item?.slug === selectedSlug) : undefined;
    const t = Array.isArray(tariffs) ? tariffs.find((item) => item?.service?.slug === selectedSlug) : undefined;
    if (s || t) {
      setFormData({
        baseRate: s ? s.basePrice : t ? t.baseRate : 150,
        minHours: t?.includedHours || (selectedSlug === "full-day-driver" ? 8 : 4),
        extraHour: t?.extraHourRate || 150,
        extraKm: t?.extraKmRate || 12,
        isActive: s ? s.isActive : true,
      });
    }
    toast.info("Changes reverted.");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header matching Reference Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            Pricing Management
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            Manage service tariffs and rates
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand-border text-brand-navy text-xs font-semibold hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Pricing Management Card matching Reference Design */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-sm space-y-8">
        {/* Service Tabs matching Reference Design */}
        <div className="flex flex-wrap items-center gap-2 border-b border-brand-border pb-4">
          {SERVICE_TABS.map((tab) => {
            const isActive = selectedSlug === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setSelectedSlug(tab.slug)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-[background-color,border-color,color] duration-150 ${
                  isActive
                    ? "bg-brand-navy text-white shadow-sm"
                    : "bg-brand-warm-bg text-secondary-text hover:text-brand-navy hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Edit Form matching Reference Design */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-secondary-text">Loading tariff parameters...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveChanges} className="space-y-6 max-w-2xl">
            {/* 2x2 Grid of Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Base Rate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Base Rate (₹)
                </label>
                <input
                  type="number"
                  value={formData.baseRate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, baseRate: Number(e.target.value) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                />
              </div>

              {/* Minimum Hours */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Minimum Hours
                </label>
                <input
                  type="number"
                  value={formData.minHours}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, minHours: Number(e.target.value) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                />
              </div>

              {/* Extra Hour */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Extra Hour (₹)
                </label>
                <input
                  type="number"
                  value={formData.extraHour}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, extraHour: Number(e.target.value) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                />
              </div>

              {/* Extra KM */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Extra KM (₹)
                </label>
                <input
                  type="number"
                  value={formData.extraKm}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, extraKm: Number(e.target.value) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-medium"
                />
              </div>
            </div>

            {/* Active Toggle Switch matching Reference Design */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-[background-color] duration-200 ease-in-out focus:outline-none ${
                  formData.isActive ? "bg-brand-orange" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={formData.isActive}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-brand-navy">Active</span>
            </div>

            {/* Bottom Actions matching Reference Design */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-border">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-navy hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <ButtonMotion
                variant="accent"
                size="md"
                type="submit"
                disabled={saving}
                isLoading={saving}
                className="!rounded-xl font-bold px-6 shadow-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </ButtonMotion>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
