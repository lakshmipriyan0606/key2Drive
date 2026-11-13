import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";
import JsonLd from "@/components/seo/JsonLd";
import { getLocalBusinessSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Contact Key2Drive | Acting Driver Booking Enquiries",
  },
  description:
    "Contact Key2Drive for acting driver bookings and service enquiries across our available locations in Tamil Nadu.",
  alternates: {
    canonical: "https://www.key2drivers.in/contact",
  },
  openGraph: {
    title: "Contact Key2Drive | Acting Driver Booking Enquiries",
    description:
      "Contact Key2Drive for acting driver bookings and service enquiries across our available locations in Tamil Nadu.",
    url: "https://www.key2drivers.in/contact",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/chauffeur-indian.jpg",
        width: 1376,
        height: 768,
        alt: "Contact Key2Drive | Acting Driver Booking Enquiries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Key2Drive | Acting Driver Booking Enquiries",
    description:
      "Contact Key2Drive for acting driver bookings and service enquiries across our available locations in Tamil Nadu.",
    images: ["/images/chauffeur-indian.jpg"],
  },
};

export default function ContactPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ]);

  const localBusinessSchema = getLocalBusinessSchema();

  return (
    <>
      <JsonLd data={[breadcrumbSchema, localBusinessSchema]} />
      <ContactPageClient />
    </>
  );
}
