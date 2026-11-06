"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Car,
  Tag,
  ArrowRight,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";

const SERVICE_IMAGES: Record<string, string> = {
  "hourly-driver":
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop",
  "full-day-driver":
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop",
  "airport-transfer":
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop",
  "outstation-driver":
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
  "corporate-services":
    "https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop",
  "personal-chauffeur":
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop";

const IMAGE_PRESETS = [
  {
    label: "City Driver",
    icon: "🚗",
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Family Sedan",
    icon: "🚙",
    url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Airport Travel",
    icon: "✈️",
    url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Highway Trip",
    icon: "🛣️",
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Corporate",
    icon: "👔",
    url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Luxury Chauffeur",
    icon: "👑",
    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop",
  },
];

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string;
  featuresList?: string[];
  image?: string;
  imageUrl?: string;
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    bookings: number;
    tariffs: number;
  };
  tariffs?: Array<{
    id: string;
    title: string;
    baseRate: number;
  }>;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [imageTab, setImageTab] = useState<"browse" | "url">("browse");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState<string>("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [priceUnit, setPriceUnit] = useState<string>("per trip");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Prevent background body scroll and dismiss on Escape key
  useEffect(() => {
    if (isModalOpen || deleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (deleteModalOpen) setDeleteModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, deleteModalOpen]);

  const fetchServices = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/services");
      if (!res.ok) {
        throw new Error("Failed to load services");
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentId(null);
    setTitle("");
    setSlug("");
    setTagline("");
    setDescription("");
    setImage(DEFAULT_IMAGE);
    setShowImagePicker(false);
    setImageTab("browse");
    setFeatures([
      "Minimum 4-hour flexible booking",
      "Manual & automatic car specialists",
      "Govt ID & driving license verified",
    ]);
    setNewFeatureInput("");
    setBasePrice(0);
    setPriceUnit("custom quote");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setModalMode("edit");
    setCurrentId(service.id);
    setTitle(service.title);
    setSlug(service.slug);
    setTagline(service.tagline || "");
    setDescription(service.description || "");

    const currentImg = service.image || service.imageUrl || SERVICE_IMAGES[service.slug] || DEFAULT_IMAGE;
    setImage(currentImg);
    setShowImagePicker(false);
    setImageTab(currentImg?.startsWith("http") ? "url" : "browse");

    let parsedFeatures: string[] = [];
    if (Array.isArray(service.featuresList) && service.featuresList.length > 0) {
      parsedFeatures = service.featuresList;
    } else {
      try {
        if (service.features) {
          const parsed = JSON.parse(service.features);
          if (Array.isArray(parsed)) parsedFeatures = parsed;
          else if (parsed && typeof parsed === "object") parsedFeatures = parsed.bullets || [];
        }
      } catch {
        parsedFeatures = service.features
          ? service.features.split("\n").filter((f) => f.trim().length > 0)
          : [];
      }
    }

    setFeatures(parsedFeatures);
    setNewFeatureInput("");
    setBasePrice(service.basePrice || 0);
    setPriceUnit(service.priceUnit || "per trip");
    setIsActive(service.isActive);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      // Instant client-side preview
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Server upload
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.url) {
        setImage(data.url);
        toast.success("Image uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeatures([...features, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a service title / name");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        tagline: tagline.trim(),
        description: description.trim(),
        image: image.trim() || undefined,
        imageUrl: image.trim() || undefined,
        features: JSON.stringify(features),
        basePrice: Number(basePrice) || 0,
        priceUnit: priceUnit.trim() || "custom quote",
        isActive,
      };

      if (modalMode === "create") {
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create service");
        }
        toast.success(`Service '${data.service?.title || title}' created successfully!`);
      } else {
        const res = await fetch(`/api/admin/services/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update service");
        }
        toast.success(`Service '${title}' updated successfully!`);
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: ServiceItem) => {
    try {
      const updatedStatus = !service.isActive;
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      toast.success(
        `'${service.title}' is now ${updatedStatus ? "Active (Visible)" : "Inactive (Hidden)"}`
      );
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: updatedStatus } : s))
      );
    } catch (err: any) {
      toast.error(err.message || "Could not update status");
    }
  };

  const confirmDelete = (service: ServiceItem) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/services/${serviceToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete service");
      }

      toast.success(data.message || `Service '${serviceToDelete.title}' deleted.`);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tagline && s.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "active") return s.isActive;
    if (statusFilter === "inactive") return !s.isActive;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy font-manrope">
              Services & Content Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-secondary-text mt-1">
            Change service titles, images (browse file or URL), marketing taglines, descriptions, feature bullet points, or add & delete services.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchServices}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-brand-border bg-white text-brand-navy hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Services"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-brand-orange" : ""}`} />
          </button>

          <ButtonMotion>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </ButtonMotion>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-brand-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search services by title, tagline or slug…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-brand-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange text-brand-navy font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary-text font-bold hidden sm:inline">Status:</span>
          {(["all", "active", "inactive"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                statusFilter === filter
                  ? "bg-brand-navy text-white"
                  : "bg-slate-100 text-secondary-text hover:bg-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Services Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-brand-orange border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-secondary-text">Loading services…</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-brand-navy">No services found</h3>
          <p className="text-xs text-secondary-text max-w-sm mx-auto">
            {searchQuery ? "No services match your search keyword." : "Get started by adding your first driver service."}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Service</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const featureItems =
              service.featuresList ||
              (service.features ? JSON.parse(service.features).catch?.(() => []) : []);

            const cardImage =
              service.image ||
              service.imageUrl ||
              SERVICE_IMAGES[service.slug] ||
              DEFAULT_IMAGE;

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={cardImage}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Slug pill overlaid */}
                  <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white font-semibold">
                    /{service.slug}
                  </span>

                  {/* Active status button overlaid */}
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => handleToggleStatus(service)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs transition-colors ${
                        service.isActive
                          ? "bg-white/95 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          : "bg-white/95 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                      title={service.isActive ? "Click to deactivate" : "Click to activate"}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          service.isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {service.isActive ? "Active" : "Hidden"}
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div>
                      <h2 className="text-base font-extrabold text-brand-navy tracking-tight group-hover:text-brand-orange transition-colors">
                        {service.title}
                      </h2>
                      {service.tagline && (
                        <p className="text-xs font-bold text-brand-orange mt-0.5">
                          {service.tagline}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-secondary-text line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Bullet features */}
                    {Array.isArray(featureItems) && featureItems.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Inclusions & Highlights
                        </span>
                        <ul className="space-y-1">
                          {featureItems.slice(0, 3).map((feat: string, idx: number) => (
                            <li key={idx} className="text-[11px] text-brand-navy flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                          {featureItems.length > 3 && (
                            <li className="text-[10px] text-slate-400 font-semibold pl-5">
                              +{featureItems.length - 3} more feature(s)
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Pricing Policy, Stats & Action Buttons */}
                  <div className="pt-4 border-t border-brand-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Pricing Policy</span>
                        <span className="text-xs font-bold text-brand-orange flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Custom Quote on Call / WhatsApp
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Bookings</span>
                        <span className="text-xs font-bold text-brand-navy">
                          {service._count?.bookings ?? 0} booked
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => openEditModal(service)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-brand-navy hover:text-white text-brand-navy text-xs font-bold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Content</span>
                      </button>

                      <button
                        onClick={() => confirmDelete(service)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Edit / Add Service Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-brand-border overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header - Always visible at the top */}
            <div className="shrink-0 px-6 py-4 border-b border-brand-border flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
                  {modalMode === "create" ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </span>
                <div>
                  <h3 id="service-modal-title" className="text-base font-bold text-brand-navy font-manrope">
                    {modalMode === "create" ? "Add New Service" : `Edit Service: ${title}`}
                  </h3>
                  <p className="text-[11px] text-secondary-text">
                    Update service content, images, and public highlights
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="service-edit-form"
              onSubmit={handleSaveService}
              className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 text-xs"
            >
              {/* Title / Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-navy">
                  Service Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hourly Driver, Outstation Driver, Luxury Chauffeur"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-brand-border text-sm font-semibold text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              {/* Slug (URL key) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-navy">
                  URL Slug (Optional - auto-generated if left blank)
                </label>
                <input
                  type="text"
                  placeholder="e.g. hourly-driver, monthly-chauffeur"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-brand-border text-xs font-mono text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              {/* Service Image (Browse or URL) */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 border border-brand-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-brand-orange" />
                    <span>Service Image</span>
                  </label>

                  {/* Mode Switch: Browse vs URL */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-brand-border text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setImageTab("browse");
                        setShowImagePicker(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        imageTab === "browse" && showImagePicker
                          ? "bg-brand-navy text-white shadow-xs"
                          : "text-secondary-text hover:text-brand-navy"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Browse File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageTab("url");
                        setShowImagePicker(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        imageTab === "url" && showImagePicker
                          ? "bg-brand-navy text-white shadow-xs"
                          : "text-secondary-text hover:text-brand-navy"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* 1. If image is present and not currently picking: Show Compact Image Preview Banner */}
                {image && !showImagePicker ? (
                  <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-slate-100 h-36 sm:h-40 group shadow-xs">
                    <img
                      src={image}
                      alt="Service Preview"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-orange" />
                      <span>Active Image</span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(true)}
                        className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImage("");
                          setShowImagePicker(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-600/85 hover:bg-red-600 text-white text-xs font-bold backdrop-blur-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 2. Otherwise: Show Image Picker (Browse Dropzone or URL) */
                  <div className="space-y-2">
                    {imageTab === "browse" ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={async (e) => {
                            await handleFileUpload(e);
                            setShowImagePicker(false);
                          }}
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-brand-orange rounded-xl p-3.5 text-center cursor-pointer bg-white transition-colors hover:bg-orange-50/20 group"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                              {uploadingImage ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                            </div>
                            <p className="text-xs font-bold text-brand-navy">
                              {uploadingImage ? "Uploading image…" : "Click to browse image from computer"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Supports PNG, JPG, WebP, SVG (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... or /images/..."
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full pl-3.5 pr-8 py-2 text-xs rounded-xl bg-white border border-brand-border text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange font-mono"
                          />
                          {image && (
                            <button
                              type="button"
                              onClick={() => setImage("")}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Presets */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            Quick Presets:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {IMAGE_PRESETS.map((p, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setImage(p.url);
                                  setShowImagePicker(false);
                                }}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                                  image === p.url
                                    ? "bg-brand-orange text-white border-brand-orange"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-brand-orange"
                                }`}
                              >
                                {p.icon} {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {image && showImagePicker && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setShowImagePicker(false)}
                          className="text-[11px] font-bold text-brand-orange hover:underline cursor-pointer"
                        >
                          Done selecting image
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tagline */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-navy">
                  Short Tagline / Marketing Hook
                </label>
                <input
                  type="text"
                  placeholder="e.g. For city traffic, shopping & flexible stops"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-brand-border text-sm text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-navy">
                  Detailed Service Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the service clearly for customers looking to hire a personal car driver…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-brand-border text-xs sm:text-sm text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange leading-relaxed"
                />
              </div>

              {/* Dynamic Feature Bullets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-navy">
                  Feature Inclusions & Bullet Points
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {features.map((feat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-navy font-medium"
                    >
                      <span className="line-clamp-1">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an inclusion bullet point…"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-brand-border text-xs text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Visibility switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-brand-navy block">Visibility Status</span>
                  <span className="text-[11px] text-secondary-text">
                    {isActive ? "Visible on customer website" : "Hidden from website"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                    isActive ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            </form>

            {/* Sticky Modal Footer - Always visible at bottom */}
            <div className="shrink-0 px-6 py-3.5 border-t border-brand-border flex items-center justify-end gap-2.5 bg-slate-50 z-10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-brand-border text-xs font-bold text-secondary-text hover:bg-white hover:text-brand-navy transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="service-edit-form"
                disabled={submitting || uploadingImage}
                className="px-5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{modalMode === "create" ? "Create Service" : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteModalOpen && serviceToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-hidden"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-extrabold text-brand-navy">
                Delete Service & Content?
              </h3>
              <p className="text-xs text-secondary-text leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-brand-navy">&ldquo;{serviceToDelete.title}&rdquo;</span>?
                {serviceToDelete._count && serviceToDelete._count.bookings > 0 && (
                  <span className="block mt-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium text-left">
                    ⚠️ Note: This service has {serviceToDelete._count.bookings} existing customer booking(s). It will be safely deactivated and removed from the public website so past customer records remain intact.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-brand-border text-xs font-bold text-secondary-text hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteService}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
