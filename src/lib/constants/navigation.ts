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
  { label: "Tariff", href: "/tariffs" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_SERVICE_LINKS: readonly NavItem[] = [
  { label: "Hourly City Driver", href: "/services#hourly" },
  { label: "Full-Day Chauffeur", href: "/services#full-day" },
  { label: "Airport Transfers", href: "/services#airport" },
  { label: "Outstation Journeys", href: "/services#outstation" },
  { label: "Corporate Retainers", href: "/services#corporate" },
  { label: "Personal Chauffeur", href: "/services#personal" },
] as const;

export const FOOTER_LEGAL_LINKS: readonly NavItem[] = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cancellation Policy", href: "/terms#cancellation" },
  { label: "Waiting Time & Surcharges", href: "/terms#waiting" },
  { label: "Privacy Policy", href: "/terms#privacy" },
  { label: "Refund Guidelines", href: "/terms#refunds" },
] as const;

export const CONTACT_DETAILS = {
  phoneDisplay: "+91 98765 43210",
  phoneTel: "+919876543210",
  phoneReviewNotice: "[Pending Client Review]",
  emailDisplay: "dispatch@key2drive.com",
  emailMailto: "dispatch@key2drive.com",
  emailReviewNotice: "[Pending Client Review]",
  addressDisplay: "Key2Drive Mobility Solutions, 100 Feet Rd, Indiranagar, Bangalore, KA - 560038",
  addressReviewNotice: "[Pending Client Review]",
  whatsappUrl: "https://wa.me/919876543210?text=Hello%20Key2Drive%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20chauffeur.",
  operatingHours: "24 Hours / 7 Days a Week",
} as const;

export interface TrustBadgeItem {
  title: string;
  description: string;
  iconName: "ShieldCheck" | "Clock" | "BadgePercent" | "Car";
}

export const TRUST_BADGES: readonly TrustBadgeItem[] = [
  {
    title: "100% Verified Chauffeurs",
    description: "Police background verified, licensed, and vetted driving pedigree.",
    iconName: "ShieldCheck",
  },
  {
    title: "24/7 Live Dispatch",
    description: "Real-time booking support, tracking, and proactive assistance.",
    iconName: "Clock",
  },
  {
    title: "Zero Surge Pricing",
    description: "Fixed transparent slabs, no peak surge, clear overtime billing.",
    iconName: "BadgePercent",
  },
  {
    title: "Luxury Fleet Care",
    description: "Certified expertise in manual, automatic, and premium luxury cars.",
    iconName: "Car",
  },
] as const;
