"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  MessageSquare,
  PhoneCall,
  Phone,
  Activity,
  Users,
  Smartphone,
  Laptop,
  Globe,
  Radio,
  Eye,
  Zap,
  BarChart3,
  TrendingUp,
  UserCheck,
  Compass,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import CustomSelect, { CustomSelectOption } from "@/components/ui/CustomSelect";

const timeRangeOptions: CustomSelectOption[] = [
  { value: "Today", label: "Today" },
  { value: "Last 7 Days", label: "Last 7 Days" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "All Time", label: "All Time" },
];

interface MetricsData {
  totalBookings?: number;
  requestedCount?: number;
  confirmedCount?: number;
  completedCount?: number;
  cancelledCount?: number;
  rejectedCount?: number;
  totalEnquiries?: number;
  pendingEnquiries?: number;
  resolvedEnquiries?: number;
  recentBookings?: Array<{
    id: string;
    reference: string;
    customerName: string;
    customerPhone: string;
    status: string;
    pickupDateTime: string;
    createdAt: string;
    service?: { title: string };
  }>;
  recentEnquiries?: Array<{
    id: string;
    name: string;
    subject: string;
    status: string;
    isResolved: boolean;
    createdAt: string;
  }>;
}

interface ChartDataPoint {
  label: string;
  hour?: number;
  date?: string;
  uniqueVisitors: number;
  pageViews: number;
  actionClicks: number;
}

interface DayVisitRecord {
  date: string;
  dateFormatted: string;
  firstSeenAt: string;
  lastSeenAt: string;
  durationSeconds: number;
  durationFormatted: string;
  isLive: boolean;
  pageViewsCount: number;
  actionsCount: number;
  totalEventsCount: number;
  pages: Array<{ page: string; views: number }>;
  actions: Array<{ eventType: string; label: string | null; count: number }>;
}

interface UniqueClientItem {
  visitorId: string;
  device: string;
  browser: string;
  os: string;
  firstSeenAt: string;
  lastSeenAt: string;
  pageViewsCount: number;
  actionsCount: number;
  isLive: boolean;
  lastPage: string;
  lastAction: string;
  intent: "HIGH" | "ENGAGED" | "BROWSING";
  durationSeconds?: number;
  durationFormatted?: string;
  totalDaysVisited?: number;
  isMultiDay?: boolean;
  dealStatus?: 'WHATSAPP_LEAD' | 'CALL_LEAD' | 'BOOKING_LEAD' | 'ENQUIRY_LEAD' | 'BROWSING';
  pageWiseList?: Array<{ page: string; views: number }>;
  actionsList?: Array<{ eventType: string; label: string | null; count: number }>;
  dayVisits?: DayVisitRecord[];
}

interface DayWiseSummary {
  date: string;
  dateFormatted: string;
  uniqueVisitors: number;
  pageViews: number;
  actionClicks: number;
  dealsCount: number;
  clientCount: number;
  topPages: Array<{ page: string; views: number }>;
}

interface AnalyticsStats {
  liveVisitors: number;
  uniqueVisitorsToday: number;
  totalUniqueVisitors: number;
  totalPageViews: number;
  totalActionClicks: number;
  actionsToday: number;
  actionBreakdown: {
    whatsappClicks: number;
    callClicks: number;
    bookingClicks: number;
    enquirySubmits: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topPages: Array<{ page: string; views: number }>;
  chartData?: ChartDataPoint[];
  uniqueClients?: UniqueClientItem[];
  dayWiseSummaries?: DayWiseSummary[];
  recentEvents: Array<{
    id: string;
    visitorId: string;
    eventType: string;
    page: string;
    label: string | null;
    device: string;
    browser: string;
    createdAt: string;
  }>;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>("Today");

  // Tab switcher: 'clients' (default) | 'daywise' | 'stream' | 'chart'
  const [viewTab, setViewTab] = useState<"clients" | "daywise" | "stream" | "chart">("clients");
  const [clientSearch, setClientSearch] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<"all" | "deals" | "multiday" | "live">("all");
  const [expandedClientIds, setExpandedClientIds] = useState<Set<string>>(new Set());
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const toggleClientExpanded = (id: string) => {
    setExpandedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);

      const [metricsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/metrics", { cache: "no-store" }),
        fetch("/api/admin/analytics", { cache: "no-store" }),
      ]);

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        if (mData.success && mData.metrics) {
          setMetrics(mData.metrics);
        }
      }

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        if (aData.success && aData.stats) {
          setAnalytics(aData.stats);
        }
      }
    } catch (err: any) {
      if (!isSilent) {
        toast.error(err.message || "Failed to load dashboard metrics");
      }
    } finally {
      setLoading(false);
      if (!isSilent) setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live Telemetry Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

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

  const getActionBadge = (eventType: string, label: string | null) => {
    switch (eventType) {
      case "click_whatsapp":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            WhatsApp Lead
          </span>
        );
      case "click_call":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <PhoneCall className="w-2.5 h-2.5" />
            Phone Call Lead
          </span>
        );
      case "submit_booking":
      case "click_book":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Car className="w-2.5 h-2.5" />
            Booking Action
          </span>
        );
      case "submit_enquiry":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <MessageSquare className="w-2.5 h-2.5" />
            Enquiry Sent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
            <Eye className="w-2.5 h-2.5" />
            {label || "Page View"}
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 15) return "Just now";
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return "Recent";
    }
  };

  const totalBookingsCount = metrics?.totalBookings ?? 0;
  const pendingRequestsCount = metrics?.requestedCount ?? 0;
  const totalEnquiriesCount = metrics?.totalEnquiries ?? 0;
  const pendingEnquiriesCount = metrics?.pendingEnquiries ?? 0;
  const liveCount = analytics?.liveVisitors ?? 0;
  const uniqueTodayCount = analytics?.uniqueVisitorsToday ?? 0;
  const totalUniqueCount = analytics?.totalUniqueVisitors ?? 0;
  const totalActionClicks = analytics?.totalActionClicks ?? 0;
  const recentBookingsList = metrics?.recentBookings ?? [];
  const chartPoints = useMemo(() => analytics?.chartData || [], [analytics?.chartData]);
  const uniqueClients = useMemo(() => analytics?.uniqueClients || [], [analytics?.uniqueClients]);
  const dayWiseSummaries = useMemo(() => analytics?.dayWiseSummaries || [], [analytics?.dayWiseSummaries]);

  const filteredClients = useMemo(() => {
    return uniqueClients.filter((client) => {
      // 1. Text Search: by Client ID, Device, OS, Browser, or Visited Pages
      if (clientSearch.trim()) {
        const q = clientSearch.toLowerCase().trim();
        const matchesId = client.visitorId.toLowerCase().includes(q);
        const matchesDev = `${client.device} ${client.browser} ${client.os}`.toLowerCase().includes(q);
        const matchesPage =
          client.pageWiseList?.some((p) => p.page.toLowerCase().includes(q)) ||
          client.lastPage.toLowerCase().includes(q);
        if (!matchesId && !matchesDev && !matchesPage) return false;
      }

      // 2. Filter tabs
      if (clientFilter === "deals") {
        return client.actionsCount > 0;
      }
      if (clientFilter === "multiday") {
        return Boolean(client.isMultiDay || (client.totalDaysVisited && client.totalDaysVisited > 1));
      }
      if (clientFilter === "live") {
        return client.isLive;
      }

      return true;
    });
  }, [uniqueClients, clientSearch, clientFilter]);

  // SVG Chart Geometry Calculations
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) return 5;
    const maxV = Math.max(
      ...chartPoints.map((p) => Math.max(p.uniqueVisitors, p.pageViews, p.actionClicks, 0))
    );
    return Math.max(maxV, 4);
  }, [chartPoints]);

  const getYCoord = useCallback(
    (val: number) => {
      const usableHeight = chartHeight - paddingY * 2;
      return chartHeight - paddingY - (val / maxVal) * usableHeight;
    },
    [maxVal]
  );

  const getXCoord = useCallback((index: number, total: number) => {
    if (total <= 1) return paddingX;
    const usableWidth = chartWidth - paddingX * 2;
    return paddingX + (index / (total - 1)) * usableWidth;
  }, []);

  // Compute smooth SVG bezier path for a series
  const computeBezierPath = useCallback(
    (points: number[]) => {
      if (!points || points.length === 0) return "";
      const coords = points.map((val, idx) => ({
        x: getXCoord(idx, points.length),
        y: getYCoord(val),
      }));

      if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

      let path = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i === 0 ? 0 : i - 1];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      return path;
    },
    [getXCoord, getYCoord]
  );

  const uniqueVisitorsPath = useMemo(() => {
    return computeBezierPath(chartPoints.map((p) => p.uniqueVisitors));
  }, [chartPoints, computeBezierPath]);

  const uniqueVisitorsAreaPath = useMemo(() => {
    if (!uniqueVisitorsPath) return "";
    const firstX = getXCoord(0, chartPoints.length);
    const lastX = getXCoord(chartPoints.length - 1, chartPoints.length);
    const baseline = chartHeight - paddingY;
    return `${uniqueVisitorsPath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [uniqueVisitorsPath, chartPoints.length, getXCoord]);

  const actionClicksPath = useMemo(() => {
    return computeBezierPath(chartPoints.map((p) => p.actionClicks));
  }, [chartPoints, computeBezierPath]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight font-manrope">
              Dashboard Overview
            </h1>
            {/* Live Telemetry Beacon Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                liveCount > 0
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  liveCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span>{liveCount} {liveCount === 1 ? "Visitor" : "Visitors"} Live Now</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            Real-time unique client telemetry & active dispatch operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Auto-Refresh Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !autoRefresh;
              setAutoRefresh(next);
              toast.info(next ? "Live auto-refresh enabled (10s)" : "Auto-refresh paused");
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              autoRefresh
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-white text-slate-600 border-brand-border hover:bg-slate-50"
            }`}
            title="Toggle live telemetry auto-refresh"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-emerald-600" : ""}`} />
            <span>{autoRefresh ? "Live 10s" : "Live Off"}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => fetchData(false)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white border border-brand-border text-brand-navy hover:bg-gray-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            title="Refresh Data Now"
            aria-label="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-brand-orange" : ""}`} />
          </button>

          {/* Date Filter Dropdown */}
          <div className="w-36 shrink-0">
            <CustomSelect
              options={timeRangeOptions}
              value={timeRange}
              onChange={(val) => setTimeRange(val)}
              size="sm"
            />
          </div>

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 bg-white border border-brand-border rounded-xl px-3 py-1.5 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center">
              A
            </div>
            <span className="text-xs font-bold text-brand-navy">Admin</span>
          </div>
        </div>
      </div>

      {/* 4 Real Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        {/* 1. Live Active Visitors */}
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active (5m)
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-text">Live on Website</p>
            <p className="text-2xl sm:text-3xl font-black text-brand-navy mt-0.5 font-manrope">
              {liveCount}
            </p>
            <p className="text-[11px] text-secondary-text mt-1 font-medium">
              Today Unique: <strong className="text-brand-navy font-bold">{uniqueTodayCount}</strong>
            </p>
          </div>
        </div>

        {/* 2. Total Unique Clients */}
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Unique Clients
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-text">Total Unique Clients</p>
            <p className="text-2xl sm:text-3xl font-black text-brand-navy mt-0.5 font-manrope">
              {totalUniqueCount}
            </p>
            <p className="text-[11px] text-secondary-text mt-1 font-medium">
              Pageviews: <strong className="text-brand-navy font-bold">{analytics?.totalPageViews ?? 0}</strong>
            </p>
          </div>
        </div>

        {/* 3. Action Clicks (WhatsApp & Call Leads) */}
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-brand-orange border border-amber-200">
              <Zap className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Lead Intent
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-text">Action Clicks (WhatsApp & Calls)</p>
            <p className="text-2xl sm:text-3xl font-black text-brand-navy mt-0.5 font-manrope">
              {totalActionClicks}
            </p>
            <p className="text-[11px] text-secondary-text mt-1 font-medium">
              {analytics?.actionBreakdown.whatsappClicks ?? 0} WhatsApp • {analytics?.actionBreakdown.callClicks ?? 0} Calls
            </p>
          </div>
        </div>

        {/* 4. Bookings & Inquiries */}
        <Link href="/admin/bookings" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2 hover:border-brand-orange/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-brand-orange group-hover:translate-x-0.5 transition-transform">
                Open Desk <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary-text">Total Bookings & Inquiries</p>
              <p className="text-2xl sm:text-3xl font-black text-brand-navy mt-0.5 font-manrope">
                {totalBookingsCount + totalEnquiriesCount}
              </p>
              <p className="text-[11px] text-secondary-text mt-1 font-medium">
                {totalBookingsCount} Bookings • {totalEnquiriesCount} Enquiries
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Interactive Feature: Unique Client Telemetry & Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (8 cols): Unique Client Activity, Day-Wise History & Telemetry Hub */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-border p-6 shadow-sm space-y-5">
          {/* Header with 4 Tab Switchers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-orange" />
                <h2 className="text-base sm:text-lg font-bold text-brand-navy font-manrope">
                  Customer Traffic & Activity Hub
                </h2>
              </div>
              <p className="text-xs text-secondary-text mt-0.5">
                Real prospective client sessions, day-wise visits, page flows & lead actions
              </p>
            </div>

            {/* View Switcher Tabs: Clients is Primary Default */}
            <div className="flex flex-wrap items-center bg-brand-warm-bg p-1 rounded-xl border border-brand-border">
              <button
                type="button"
                onClick={() => setViewTab("clients")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewTab === "clients"
                    ? "bg-white text-brand-navy shadow-xs"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-orange" />
                <span>Clients & Deals ({uniqueClients.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("daywise")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewTab === "daywise"
                    ? "bg-white text-brand-navy shadow-xs"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                <span>Day-Wise Log ({dayWiseSummaries.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("stream")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewTab === "stream"
                    ? "bg-white text-brand-navy shadow-xs"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("chart")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewTab === "chart"
                    ? "bg-white text-brand-navy shadow-xs"
                    : "text-secondary-text hover:text-brand-navy"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Trend Chart</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CLIENT ACTIVITY & DEALS DIRECTORY (PRIMARY VIEW) */}
          {viewTab === "clients" && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Client #ID, device, or page URL…"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-brand-border text-xs text-brand-navy placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  {clientSearch && (
                    <button
                      type="button"
                      onClick={() => setClientSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  <button
                    type="button"
                    onClick={() => setClientFilter("all")}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      clientFilter === "all"
                        ? "bg-brand-navy text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All ({uniqueClients.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientFilter("deals")}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      clientFilter === "deals"
                        ? "bg-amber-500 text-slate-950 shadow-2xs"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    ⚡ Lead Deals ({uniqueClients.filter((c) => c.actionsCount > 0).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientFilter("multiday")}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      clientFilter === "multiday"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                    }`}
                  >
                    🔁 Multi-Day ({uniqueClients.filter((c) => c.isMultiDay || (c.totalDaysVisited && c.totalDaysVisited > 1)).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientFilter("live")}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      clientFilter === "live"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    ● Live ({uniqueClients.filter((c) => c.isLive).length})
                  </button>
                </div>
              </div>

              {/* Client Cards List */}
              {filteredClients.length > 0 ? (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredClients.map((client) => {
                    const isExpanded = expandedClientIds.has(client.visitorId);
                    const pagesList =
                      client.pageWiseList && client.pageWiseList.length > 0
                        ? client.pageWiseList
                        : [{ page: client.lastPage || "/", views: client.pageViewsCount || 1 }];

                    return (
                      <div
                        key={client.visitorId}
                        className="p-4 rounded-2xl bg-slate-50/70 border border-brand-border hover:border-brand-orange/40 hover:bg-white transition-all space-y-3"
                      >
                        {/* Top Row: Client ID, Device badges, Live badge, Multi-Day badge, and Deal Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-brand-border text-brand-navy font-mono text-xs font-bold shadow-2xs">
                              {client.device === "Mobile" ? (
                                <Smartphone className="w-3.5 h-3.5 text-brand-orange" />
                              ) : (
                                <Laptop className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              <span>#{client.visitorId.slice(-6)}</span>
                            </div>

                            <span className="text-[11px] font-semibold text-secondary-text">
                              {client.device} • {client.browser} ({client.os})
                            </span>

                            {client.isLive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Now
                              </span>
                            )}

                            {client.isMultiDay && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-indigo-600" />
                                Returning ({client.totalDaysVisited || client.dayVisits?.length || 2} Days Active)
                              </span>
                            )}
                          </div>

                          {/* Deal Status / Conversion Badge */}
                          <div>
                            {client.dealStatus === "WHATSAPP_LEAD" ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                💬 WhatsApp Lead
                              </span>
                            ) : client.dealStatus === "CALL_LEAD" ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                                <PhoneCall className="w-3 h-3 text-amber-700" />
                                📞 Direct Call Lead
                              </span>
                            ) : client.dealStatus === "BOOKING_LEAD" ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
                                <Car className="w-3 h-3 text-blue-700" />
                                🚗 Booking Dispatch Lead
                              </span>
                            ) : client.dealStatus === "ENQUIRY_LEAD" ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5 shadow-2xs">
                                <MessageSquare className="w-3 h-3 text-purple-700" />
                                ✉️ Enquiry Lead
                              </span>
                            ) : client.intent === "ENGAGED" ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                ⚡ Engaged ({client.pageViewsCount} views)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                                👁️ Browsing Prospect
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Metrics Grid: Duration, Total Interactions, Activity Window */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Duration on Site
                            </span>
                            <span className="font-bold text-brand-navy flex items-center gap-1 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-brand-orange" />
                              {client.durationFormatted || "< 1 min"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Interactions
                            </span>
                            <span className="font-bold text-brand-navy flex items-center gap-1 mt-0.5">
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              {client.pageViewsCount} Views {client.actionsCount > 0 ? `+ ${client.actionsCount} Deals` : ""}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              First Seen
                            </span>
                            <span className="font-semibold text-secondary-text block mt-0.5">
                              {formatRelativeTime(client.firstSeenAt)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Last Active
                            </span>
                            <span className="font-semibold text-brand-navy block mt-0.5">
                              {formatRelativeTime(client.lastSeenAt)}
                            </span>
                          </div>
                        </div>

                        {/* Page-wise List: Badges of pages visited */}
                        <div className="space-y-1.5 pt-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Pages Visited & Journey:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {pagesList.map((p, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-brand-border text-[11px] font-medium text-brand-navy shadow-2xs"
                              >
                                <span className="font-mono text-slate-700">{p.page}</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {p.views}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Multi-Day Journey Breakdown */}
                        {client.dayVisits && client.dayVisits.length > 1 && (
                          <div className="pt-2 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => toggleClientExpanded(client.visitorId)}
                              className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 text-xs font-bold text-indigo-900 border border-indigo-200/80 transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Day-Wise Journey ({client.dayVisits.length} Days Recorded)</span>
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-indigo-700" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-indigo-700" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-2 pl-2 border-l-2 border-indigo-300">
                                {client.dayVisits.map((day, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="p-3 rounded-xl bg-white border border-indigo-100 text-xs space-y-2 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between font-bold text-brand-navy">
                                      <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                        {day.dateFormatted} ({day.date})
                                      </span>
                                      <span className="text-[11px] text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                        ⏱️ {day.durationFormatted}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-secondary-text">
                                      <span>📄 {day.pageViewsCount} pages viewed</span>
                                      <span>
                                        ⚡ {day.actionsCount > 0 ? `${day.actionsCount} actions taken` : "Browsed only"}
                                      </span>
                                      {day.actions && day.actions.length > 0 && (
                                        <span className="text-emerald-700 font-bold">
                                          Action: {day.actions.map((a) => a.label || a.eventType).join(", ")}
                                        </span>
                                      )}
                                    </div>

                                    {/* Pages seen on this day */}
                                    <div className="flex flex-wrap gap-1 text-[10px]">
                                      {day.pages.map((dp, dpIdx) => (
                                        <span
                                          key={dpIdx}
                                          className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 font-mono"
                                        >
                                          {dp.page} ({dp.views})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <UserCheck className="w-9 h-9 text-slate-300 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-brand-navy">
                      {clientSearch || clientFilter !== "all"
                        ? "No Clients Match Your Filters"
                        : "Ready for Live Customer Traffic"}
                    </p>
                    <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1 leading-relaxed">
                      {clientSearch || clientFilter !== "all"
                        ? "Try clearing your search terms or filter pills to see all recorded customer visits."
                        : "When prospective customers browse services, view pricing, or click WhatsApp/Call, their duration, page journey, and deals stream here."}
                    </p>
                  </div>

                  {clientSearch || clientFilter !== "all" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setClientSearch("");
                        setClientFilter("all");
                      }}
                      className="px-4 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <div className="pt-1">
                      <a
                        href="/services"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orange-hover transition-colors shadow-2xs"
                      >
                        <span>Open Public Services Page in New Tab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DAY-WISE LOG SUMMARY */}
          {viewTab === "daywise" && (
            <div className="space-y-4">
              {dayWiseSummaries.length > 0 ? (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {dayWiseSummaries.map((day) => (
                    <div
                      key={day.date}
                      className="p-4 rounded-2xl bg-white border border-brand-border shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-brand-navy text-sm font-manrope">
                            {day.dateFormatted}
                          </span>
                          <span className="text-xs text-secondary-text font-mono">({day.date})</span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {day.dealsCount} Deal Leads
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Unique Clients</span>
                          <span className="text-base font-black text-brand-navy mt-0.5 block font-manrope">
                            {day.uniqueVisitors}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Page Views</span>
                          <span className="text-base font-black text-blue-600 mt-0.5 block font-manrope">
                            {day.pageViews}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Action Clicks</span>
                          <span className="text-base font-black text-emerald-600 mt-0.5 block font-manrope">
                            {day.actionClicks}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Page Visited</span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block font-mono truncate">
                            {day.topPages[0]?.page || "/"}
                          </span>
                        </div>
                      </div>

                      {day.topPages.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Most Viewed Pages on {day.dateFormatted}:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {day.topPages.map((tp, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-brand-navy text-[11px] font-mono border border-slate-200"
                              >
                                {tp.page} ({tp.views} views)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-brand-navy">No Day-Wise Logs Yet</p>
                  <p className="text-[11px] text-secondary-text max-w-sm mx-auto">
                    Daily totals will automatically organize here as prospective clients browse the website day-by-day.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE EVENT FEED */}
          {viewTab === "stream" && (
            <div className="overflow-x-auto">
              {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                <table className="w-full text-left text-xs tabular-nums">
                  <thead className="bg-brand-warm-bg/60 border-b border-brand-border text-secondary-text uppercase font-bold text-[10px]">
                    <tr>
                      <th scope="col" className="px-4 py-3">Time</th>
                      <th scope="col" className="px-4 py-3">Client</th>
                      <th scope="col" className="px-4 py-3">Customer Page</th>
                      <th scope="col" className="px-4 py-3 text-right">Action Event</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {analytics.recentEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-brand-warm-bg/30 transition-colors">
                        <td className="px-4 py-3 text-secondary-text font-medium whitespace-nowrap">
                          {formatRelativeTime(event.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {event.device === "Mobile" ? (
                              <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="font-mono text-[11px] font-bold text-brand-navy">
                              #{event.visitorId.slice(-6)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-brand-navy">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {event.page}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {getActionBadge(event.eventType, event.label)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-brand-navy">No Public Client Events Logged Yet</p>
                  <p className="text-[11px] text-secondary-text max-w-sm mx-auto">
                    Visit any public customer page like `/services` or `/book` to see live events streaming here in real time.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TREND CHART */}
          {viewTab === "chart" && (
            <div className="space-y-4">
              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-brand-navy">Unique Clients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-brand-orange" />
                    <span className="font-semibold text-brand-navy">Lead Actions (WhatsApp/Calls)</span>
                  </div>
                </div>

                {hoveredPointIndex !== null && chartPoints[hoveredPointIndex] && (
                  <div className="px-3 py-1 rounded-xl bg-slate-100 text-brand-navy font-bold text-xs flex items-center gap-3">
                    <span>{chartPoints[hoveredPointIndex].label}</span>
                    <span className="text-emerald-700">
                      Clients: {chartPoints[hoveredPointIndex].uniqueVisitors}
                    </span>
                    <span className="text-brand-orange">
                      Actions: {chartPoints[hoveredPointIndex].actionClicks}
                    </span>
                  </div>
                )}
              </div>

              {/* SVG Interactive Chart Box */}
              <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-slate-50/50 to-white rounded-2xl border border-brand-border/60 p-2 overflow-visible">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const y = chartHeight - paddingY - frac * (chartHeight - paddingY * 2);
                    return (
                      <line
                        key={idx}
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Emerald Area Fill (Unique Clients) */}
                  {uniqueVisitorsAreaPath && (
                    <path d={uniqueVisitorsAreaPath} fill="url(#emeraldAreaGradient)" />
                  )}

                  {/* Emerald Spline Curve (Unique Clients) */}
                  {uniqueVisitorsPath && (
                    <path
                      d={uniqueVisitorsPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Orange Curve (Lead Actions) */}
                  {actionClicksPath && (
                    <path
                      d={actionClicksPath}
                      fill="none"
                      stroke="#f58220"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Interactive Coordinate Points */}
                  {chartPoints.map((point, idx) => {
                    const cx = getXCoord(idx, chartPoints.length);
                    const cyVisitors = getYCoord(point.uniqueVisitors);
                    const cyActions = getYCoord(point.actionClicks);
                    const isHovered = hoveredPointIndex === idx;

                    return (
                      <g key={idx}>
                        {/* Hover bar column trigger */}
                        <rect
                          x={cx - 18}
                          y={paddingY}
                          width={36}
                          height={chartHeight - paddingY * 2}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPointIndex(idx)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        />

                        {/* Unique Visitors Point */}
                        <circle
                          cx={cx}
                          cy={cyVisitors}
                          r={isHovered ? 6 : 4}
                          fill="#ffffff"
                          stroke="#10b981"
                          strokeWidth={isHovered ? 3 : 2}
                          className="transition-all"
                        />

                        {/* Action Point */}
                        {point.actionClicks > 0 && (
                          <circle
                            cx={cx}
                            cy={cyActions}
                            r={isHovered ? 6 : 4}
                            fill="#f58220"
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 3 : 2}
                            className="transition-all"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[11px] font-semibold text-secondary-text pt-2 px-3 border-t border-brand-border">
                  {chartPoints.map((p, idx) => (
                    <span
                      key={idx}
                      className={hoveredPointIndex === idx ? "text-brand-orange font-bold" : ""}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT (4 cols): Lead Intent & Device Demographics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Lead Intent Breakdown */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-sm space-y-4">
            <div className="border-b border-brand-border pb-3">
              <h2 className="text-base font-bold text-brand-navy font-manrope">
                Customer Intent Breakdown
              </h2>
              <p className="text-xs text-secondary-text mt-0.5">
                Conversion actions tracked across public visits
              </p>
            </div>

            <div className="space-y-3 text-xs tabular-nums">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-950">WhatsApp Inquiries</span>
                </div>
                <span className="font-black text-sm text-emerald-800">
                  {analytics?.actionBreakdown.whatsappClicks ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-950">Direct Phone Calls</span>
                </div>
                <span className="font-black text-sm text-amber-800">
                  {analytics?.actionBreakdown.callClicks ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-blue-950">Booking Submissions</span>
                </div>
                <span className="font-black text-sm text-blue-800">
                  {totalBookingsCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="font-bold text-purple-950">Contact Form Messages</span>
                </div>
                <span className="font-black text-sm text-purple-800">
                  {totalEnquiriesCount}
                </span>
              </div>
            </div>
          </div>

          {/* Device Demographics */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-sm space-y-4">
            <div className="border-b border-brand-border pb-3">
              <h2 className="text-base font-bold text-brand-navy font-manrope">
                Client Device Types
              </h2>
              <p className="text-xs text-secondary-text mt-0.5">
                Client categories visiting the website
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-brand-navy">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" /> Mobile Phones
                </span>
                <span className="font-bold text-brand-navy">
                  {analytics?.deviceBreakdown.mobile ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-brand-navy">
                  <Laptop className="w-3.5 h-3.5 text-slate-500" /> Desktops & Laptops
                </span>
                <span className="font-bold text-brand-navy">
                  {analytics?.deviceBreakdown.desktop ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-brand-navy">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Tablets & Others
                </span>
                <span className="font-bold text-brand-navy">
                  {analytics?.deviceBreakdown.tablet ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Bookings Desk */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div>
            <h2 className="text-base font-bold text-brand-navy font-manrope">
              Recent Customer Bookings
            </h2>
            <p className="text-xs text-secondary-text">
              Real client bookings awaiting dispatch attendance
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-brand-border">
          {recentBookingsList && recentBookingsList.length > 0 ? (
            recentBookingsList.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <Link
                    href={`/admin/bookings?search=${booking.reference}`}
                    className="font-mono font-bold text-brand-navy hover:text-brand-orange transition-colors"
                  >
                    {booking.reference}
                  </Link>
                  <p className="text-secondary-text mt-0.5">
                    {booking.customerName} • {booking.service?.title || "Acting Driver"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(booking.status)}
                  <Link
                    href={`/admin/bookings?search=${booking.reference}`}
                    className="px-2.5 py-1 rounded-lg border border-brand-border text-brand-navy font-bold hover:bg-slate-50"
                  >
                    Attend
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center space-y-1.5">
              <Car className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-brand-navy">No Customer Bookings Yet</p>
              <p className="text-[11px] text-secondary-text">
                When customers submit bookings through the website, they will appear here in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
