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
  default: `*Hello Key2Drive!*
I would like to book a professional acting driver for my car.

• Pickup Address / Area: 
• Date & Time: 
• Car Model & Transmission (Manual / Automatic): 
• Service Required (Hourly / Full Day / Airport / Outstation): 

Please share driver availability and charges. Thank you!`,

  hourly: `*Hello Key2Drive!*
I would like to book an *Hourly Acting Driver* for city travel.

• Service: Hourly City Driver
• Pickup Location / Area: 
• Date & Pickup Time: 
• Estimated Duration (e.g. 4 hrs / 6 hrs): 
• Car Model & Transmission (Manual / Automatic): 

Please confirm driver availability and hourly rates. Thank you!`,

  fullDay: `*Hello Key2Drive!*
I would like to book a *Full-Day Driver* (8 hrs / 80 km package) for my vehicle.

• Service: Full-Day Driver (8 hrs / 80 km)
• Pickup Location / Area: 
• Date & Start Time: 
• Car Model & Transmission (Manual / Automatic): 

Please confirm driver availability and package charges. Thank you!`,

  airport: `*Hello Key2Drive!*
I would like to book an *Airport Transfer Acting Driver*.

• Service: Airport Transfer
• Trip Type: Airport Drop / Airport Pickup
• Pickup / Drop Address: 
• Flight Date & Schedule: 
• Car Model & Transmission: 

Please confirm driver availability and airport transfer rates. Thank you!`,

  outstation: `*Hello Key2Drive!*
I would like to book an *Outstation Acting Driver* for an intercity highway journey.

• Service: Outstation Highway Trip
• Starting City / Area: 
• Destination City / Place: 
• Departure Date & Time: 
• Return Date (if round-trip): 
• Car Model & Transmission (Manual / Automatic): 

Please confirm driver availability, outstation allowance, and charges. Thank you!`,

  corporate: `*Hello Key2Drive!*
I would like to inquire about *Corporate Driver / Monthly Retainer* services.

• Service: Corporate Driver
• Company / Individual Name: 
• Location / City: 
• Requirement: Monthly Driver / Corporate Duty
• Vehicle Make & Model: 

Please share corporate quotation and onboarding details. Thank you!`,

  personal: `*Hello Key2Drive!*
I would like to book a dedicated *Personal Driver* for private / family duty.

• Service: Personal Driver
• Pickup Area / Address: 
• Required Schedule (Daily / Weekly / Monthly): 
• Car Model & Transmission (Manual / Automatic): 

Please share driver availability and quote. Thank you!`,
} as const;

export function getWhatsAppUrl(
  customMessage?: string,
  phoneNumber: string = "919600992709"
): string {
  const message = customMessage || WHATSAPP_GREETINGS.default;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function getServiceWhatsAppUrl(
  service: { title: string; slug?: string; description?: string },
  phoneNumber: string = "919600992709"
): string {
  const slug = (service.slug || "").toLowerCase();
  const title = (service.title || "").toLowerCase();

  if (slug.includes("full") || slug.includes("day") || title.includes("full-day") || title.includes("full day")) {
    return getWhatsAppUrl(WHATSAPP_GREETINGS.fullDay, phoneNumber);
  }
  if (slug.includes("hourly") || title.includes("hourly")) {
    return getWhatsAppUrl(WHATSAPP_GREETINGS.hourly, phoneNumber);
  }
  if (slug.includes("airport") || title.includes("airport")) {
    return getWhatsAppUrl(WHATSAPP_GREETINGS.airport, phoneNumber);
  }
  if (slug.includes("outstation") || title.includes("outstation")) {
    return getWhatsAppUrl(WHATSAPP_GREETINGS.outstation, phoneNumber);
  }
  if (slug.includes("corporate") || title.includes("corporate")) {
    return getWhatsAppUrl(WHATSAPP_GREETINGS.corporate, phoneNumber);
  }
  if (slug.includes("personal") || title.includes("personal")) {
    return getWhatsAppUrl(WHATSAPP_GREETINGS.personal, phoneNumber);
  }

  // Exact fallback for any other service title
  const custom = `*Hello Key2Drive!*\nI would like to book the *${service.title}* service for my car.\n\n• Service: ${service.title}\n• Pickup Location / Area: \n• Date & Time: \n• Car Model & Transmission (Manual / Automatic): \n\nPlease confirm driver availability and pricing. Thank you!`;
  return getWhatsAppUrl(custom, phoneNumber);
}

export const CONTACT_DETAILS = {
  phoneDisplay: "+91 96009 92709",
  phoneTel: "+919600992709",
  phoneRaw: "9600992709",
  phoneWhatsapp: "919600992709",
  phoneReviewNotice: "",
  emailDisplay: "key2drivers@gmail.com",
  emailMailto: "key2drivers@gmail.com",
  emailReviewNotice: "",
  addressDisplay: "Saai Avenue, Sekar Nagar, New Perungalathur, Chennai - 600063",
  addressFull: "Key2Drive Mobility Solutions, Saai Avenue, Sekar Nagar, New Perungalathur, Chennai, Tamil Nadu - 600063",
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
