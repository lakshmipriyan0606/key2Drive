/**
 * Navigation and brand constants for Key2Drive universal shell.
 * Path: src/lib/constants/navigation.ts
 */

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_SERVICE_LINKS: readonly NavItem[] = [
  { label: "Hourly City Driver", href: "/services#hourly" },
  { label: "Full-Day Driver", href: "/services#full-day" },
  { label: "Airport Transfers", href: "/services#airport" },
  { label: "Outstation Journeys", href: "/services#outstation" },
  { label: "Corporate Drivers", href: "/services#corporate" },
  { label: "Personal Driver", href: "/services#personal" },
] as const;

export const FOOTER_LEGAL_LINKS: readonly NavItem[] = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cancellation Policy", href: "/terms#cancellation" },
  { label: "Waiting Time & Surcharges", href: "/terms#waiting" },
  { label: "Privacy Policy", href: "/terms#privacy" },
  { label: "Refund Guidelines", href: "/terms#refunds" },
] as const;

export const WHATSAPP_GREETINGS = {
  default: `Hello Key2Drive! 👋\nI would like to book a professional acting driver for my car.\n\n📍 Pickup Location:\n📅 Date & Time:\n🚗 Car Model & Transmission (Manual/Auto):\n⏱️ Service (Hourly / Full Day / Airport / Outstation):\n\nPlease share driver availability and charges. Thank you!`,
  hourly: `Hello Key2Drive! 👋\nI would like to book an Hourly Acting Driver for flexible city travel.\n\n📍 Pickup Location:\n📅 Date & Time:\n🚗 Car Model:\n\nPlease share driver availability and pricing. Thank you!`,
  fullDay: `Hello Key2Drive! 👋\nI would like to book a Full-Day Acting Driver (8 hrs / 80 km) for my car.\n\n📍 Pickup Location:\n📅 Date & Time:\n🚗 Car Model:\n\nPlease share driver availability and pricing. Thank you!`,
  airport: `Hello Key2Drive! 👋\nI would like to book an Airport Pickup / Drop Acting Driver.\n\n📍 Pickup / Drop Location:\n📅 Flight Time & Date:\n🚗 Car Model:\n\nPlease share driver availability and pricing. Thank you!`,
  outstation: `Hello Key2Drive! 👋\nI would like to book an Outstation Acting Driver for an intercity journey.\n\n📍 Departure City & Destination:\n📅 Travel Dates:\n🚗 Car Model:\n\nPlease share driver availability and outstation allowance details. Thank you!`,
} as const;

export function getWhatsAppUrl(customMessage?: string): string {
  const message = customMessage || WHATSAPP_GREETINGS.default;
  return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
}

export const CONTACT_DETAILS = {
  phoneDisplay: "+91 98765 43210",
  phoneTel: "+919876543210",
  phoneReviewNotice: "",
  emailDisplay: "dispatch@key2drive.com",
  emailMailto: "dispatch@key2drive.com",
  emailReviewNotice: "",
  addressDisplay: "Key2Drive Mobility Solutions, 100 Feet Rd, Indiranagar, Bangalore, KA - 560038",
  addressReviewNotice: "",
  whatsappUrl: getWhatsAppUrl(),
  operatingHours: "24 Hours / 7 Days a Week",
} as const;

export interface TrustBadgeItem {
  title: string;
  description: string;
  iconName: "ShieldCheck" | "Clock" | "BadgePercent" | "Car";
}

export const TRUST_BADGES: readonly TrustBadgeItem[] = [
  {
    title: "100% Verified Drivers",
    description: "Government ID & Driving License authenticated, vetted driving pedigree.",
    iconName: "ShieldCheck",
  },
  {
    title: "24/7 Live Dispatch",
    description: "Real-time booking support, tracking, and proactive assistance.",
    iconName: "Clock",
  },
  {
    title: "Transparent Billing",
    description: "Custom quotes discussed directly with dispatch, zero hidden charges.",
    iconName: "BadgePercent",
  },
  {
    title: "All Vehicles Expertise",
    description: "Expert competence in manual, automatic, SUV, and luxury cars.",
    iconName: "Car",
  },
] as const;
