"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ButtonMotion from "@/components/ui/ButtonMotion";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "PENDING" | "IN_REVIEW" | "RESOLVED";
  isResolved: boolean;
  internalNotes: string | null;
  createdAt: string;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: { name: string };
  }>;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Selected for viewing
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [newNote, setNewNote] = useState<string>("");
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);

  const fetchEnquiries = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: "ALL",
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(Array.isArray(data.enquiries) ? data.enquiries : []);
        setTotal(data.total ?? 0);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Toggle Resolved status
  const handleToggleResolve = async (enquiry: Enquiry) => {
    const nextResolved = !enquiry.isResolved;
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isResolved: nextResolved,
          status: nextResolved ? "RESOLVED" : "PENDING",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");

      toast.success(
        `Enquiry marked as ${nextResolved ? "Resolved" : "Pending"}`
      );
      if (selectedEnquiry && selectedEnquiry.id === enquiry.id) {
        setSelectedEnquiry({
          ...selectedEnquiry,
          isResolved: nextResolved,
          status: nextResolved ? "RESOLVED" : "PENDING",
        });
      }
      fetchEnquiries();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Note failed");

      toast.success("Follow-up note logged.");
      setNewNote("");
      // Refresh current enquiry
      const updatedRes = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`);
      const updatedData = await updatedRes.json();
      if (updatedData.success && updatedData.enquiry) {
        setSelectedEnquiry(updatedData.enquiry);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const getStatusBadge = (status: string, isResolved: boolean) => {
    if (isResolved || status === "RESOLVED") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Resolved
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        Pending
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header matching Reference Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            Customer Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            Customer messages, corporate retainers, and dispatch requests
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand-border text-brand-navy text-xs font-semibold hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Search Action Bar matching Reference Design */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange text-xs font-medium"
          />
        </div>
      </div>

      {/* Enquiries Table matching Reference Design */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-secondary-text">Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-brand-navy text-sm">No Enquiries Found</h3>
            <p className="text-xs text-secondary-text">No customer messages match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-warm-bg/60 border-b border-brand-border text-secondary-text uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-brand-warm-bg/30 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-brand-navy">{e.name}</span>
                    </td>

                    {/* Subject */}
                    <td className="px-5 py-3.5">
                      <span className="text-secondary-text font-medium">{e.subject}</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {getStatusBadge(e.status, e.isResolved)}
                    </td>

                    {/* Action View Button */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedEnquiry(e)}
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

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="font-bold text-base text-brand-navy">{selectedEnquiry.subject}</h3>
                <p className="text-xs text-secondary-text">From {selectedEnquiry.name}</p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-brand-warm-bg/50 border border-brand-border">
                <div>
                  <span className="text-secondary-text">Phone:</span>
                  <p className="font-bold text-brand-navy">{selectedEnquiry.phone}</p>
                </div>
                <div>
                  <span className="text-secondary-text">Email:</span>
                  <p className="font-bold text-brand-navy">{selectedEnquiry.email}</p>
                </div>
              </div>

              <div>
                <span className="text-secondary-text font-bold uppercase tracking-wider text-[10px]">
                  Customer Message:
                </span>
                <p className="p-3.5 rounded-xl bg-white border border-brand-border text-brand-navy leading-relaxed mt-1">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-brand-navy">Resolution Status:</span>
                <button
                  onClick={() => handleToggleResolve(selectedEnquiry)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedEnquiry.isResolved
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {selectedEnquiry.isResolved ? "Reopen Enquiry" : "Mark as Resolved"}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-brand-border">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="w-full py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-deep"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
