"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Car,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  MessageSquare,
  Plus,
  Send,
  MapPin,
  User,
  Phone,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";
import CustomSelect, { CustomSelectOption } from "@/components/ui/CustomSelect";

interface Booking {
  id: string;
  reference: string;
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: string;
  dropAddress: string | null;
  pickupDateTime: string;
  duration: string | null;
  vehicleInfo: string | null;
  specialInstructions: string | null;
  estimatedAmount: number;
  finalAmount: number | null;
  createdAt: string;
  service?: {
    id: string;
    title: string;
    slug: string;
  };
  notes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: { name: string };
  }>;
  statusHistory?: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    changedBy: string;
    createdAt: string;
  }>;
}

const statusOptions: CustomSelectOption[] = [
  { value: "ALL", label: "All Status" },
  { value: "REQUESTED", label: "Pending Requests", badge: "Action Req", badgeColor: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "CONFIRMED", label: "Confirmed", badge: "Active", badgeColor: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "COMPLETED", label: "Completed", badge: "Done", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "CANCELLED", label: "Cancelled", badge: "Void", badgeColor: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "REJECTED", label: "Rejected", badge: "Declined", badgeColor: "bg-red-100 text-red-800 border-red-200" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Selected Booking for Detailed Inspection Drawer
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  // New Note state
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  const fetchBookings = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: selectedStatus,
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      if (data.success) {
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        setTotal(data.total ?? 0);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, selectedStatus, searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Open detailed drawer and fetch full booking details including notes
  const handleInspect = async (idOrRef: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/bookings/${idOrRef}`);
      const data = await res.json();
      if (data.success && data.booking) {
        setSelectedBooking(data.booking);
      } else {
        throw new Error(data.error || "Booking not found");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load booking details");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Perform Status Transition
  const handleUpdateStatus = async (
    nextStatus: "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED",
    note?: string
  ) => {
    if (!selectedBooking) return;
    setStatusUpdating(true);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          note: note || `Status updated to ${nextStatus} via admin console.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Status transition failed.");
      }

      toast.success(`Booking ${selectedBooking.reference} marked as ${nextStatus}!`);
      setSelectedBooking(data.booking);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "Status update failed.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Add Admin Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newNoteContent.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add note.");
      }

      toast.success("Admin note saved.");
      setNewNoteContent("");
      handleInspect(selectedBooking.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to add note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Pending
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Confirmed
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Completed
          </span>
        );
      case "CANCELLED":
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header matching Reference Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            Bookings Management
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            Manage trip requests, dispatch status, and customer notes
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand-border text-brand-navy text-xs font-semibold hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Filter and Search Bar matching Reference Design */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-xs font-medium"
          />
        </div>

        {/* Status Dropdown matching reference design */}
        <div className="w-full sm:w-56 shrink-0">
          <CustomSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              setPage(1);
            }}
            size="sm"
          />
        </div>
      </div>

      {/* Bookings Table matching Reference Design */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-secondary-text">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Car className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-brand-navy text-sm">No Bookings Found</h3>
            <p className="text-xs text-secondary-text">Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-warm-bg/60 border-b border-brand-border text-secondary-text uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Ref #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-brand-warm-bg/30 transition-colors">
                    {/* Ref # */}
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-navy">
                      <button
                        onClick={() => handleInspect(b.id)}
                        className="text-brand-orange hover:underline focus:outline-none"
                      >
                        {b.reference}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-brand-navy">{b.customerName}</span>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-3.5">
                      <span className="text-brand-navy font-medium">
                        {b.service?.title || "Chauffeur"}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-3.5 text-secondary-text">
                      {formatDateTime(b.pickupDateTime)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {getStatusBadge(b.status)}
                    </td>

                    {/* Action View Button */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleInspect(b.id)}
                        className="px-3 py-1 rounded-lg border border-brand-border text-brand-navy text-xs font-bold hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination matching Reference Design: "< 1 2 3 >" */}
        <div className="p-4 border-t border-brand-border flex items-center justify-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-brand-border flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                page === p
                  ? "bg-brand-orange text-white shadow-sm"
                  : "border border-brand-border text-brand-navy hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg border border-brand-border flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs text-secondary-text font-bold uppercase tracking-wider">
                  Booking Inspection
                </span>
                <h2 className="text-xl font-bold font-mono text-brand-navy">
                  {selectedBooking.reference}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-secondary-text hover:text-brand-navy hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Status Transition Control */}
              <div className="p-4 rounded-xl bg-brand-warm-bg border border-brand-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-navy">Current Status</span>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-border/60">
                  {selectedBooking.status === "REQUESTED" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus("CONFIRMED")}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                      >
                        Confirm Booking
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("REJECTED")}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedBooking.status === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus("COMPLETED")}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("CANCELLED")}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg bg-gray-600 text-white text-xs font-bold hover:bg-gray-700"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Customer & Trip Details */}
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-sm text-brand-navy">Trip Details</h3>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-brand-border bg-white">
                  <div>
                    <span className="text-secondary-text">Customer:</span>
                    <p className="font-bold text-brand-navy">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <span className="text-secondary-text">Phone:</span>
                    <p className="font-bold text-brand-navy">{selectedBooking.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-secondary-text">Service:</span>
                    <p className="font-bold text-brand-navy">{selectedBooking.service?.title}</p>
                  </div>
                  <div>
                    <span className="text-secondary-text">Est. Fare:</span>
                    <p className="font-bold text-brand-orange">₹{selectedBooking.estimatedAmount}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-secondary-text">Pickup Address:</span>
                    <p className="font-medium text-brand-navy">{selectedBooking.pickupAddress}</p>
                  </div>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-sm text-brand-navy">Internal Admin Notes</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedBooking.notes && selectedBooking.notes.length > 0 ? (
                    selectedBooking.notes.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-brand-warm-bg border border-brand-border text-xs">
                        <p className="text-brand-navy">{n.content}</p>
                        <span className="text-[10px] text-secondary-text mt-1 block">
                          {n.author?.name || "Admin"} • {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-secondary-text text-xs italic">No internal notes yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add operational note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-orange"
                  />
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteContent.trim()}
                    className="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold disabled:opacity-40"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-brand-border bg-brand-warm-bg/50">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2.5 rounded-xl bg-white border border-brand-border text-brand-navy text-xs font-bold hover:bg-gray-50"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
