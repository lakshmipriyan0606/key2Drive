import type { Metadata } from "next";
import BookPageClient from "./BookPageClient";
import JsonLd from "@/components/seo/JsonLd";
import { getServiceSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Book an Acting Driver Online in Tamil Nadu | Key2Drive",
  },
  description:
    "Need an acting driver? Book a professional driver for your personal car through Key2Drive. Submit your booking enquiry today.",
  alternates: {
    canonical: "https://www.key2drivers.in/book",
  },
  openGraph: {
    title: "Book an Acting Driver Online in Tamil Nadu | Key2Drive",
    description:
      "Need an acting driver? Book a professional driver for your personal car through Key2Drive. Submit your booking enquiry today.",
    url: "https://www.key2drivers.in/book",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/chauffeur-indian.jpg",
        width: 1376,
        height: 768,
        alt: "Book an Acting Driver Online in Tamil Nadu | Key2Drive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book an Acting Driver Online in Tamil Nadu | Key2Drive",
    description:
      "Need an acting driver? Book a professional driver for your personal car through Key2Drive. Submit your booking enquiry today.",
    images: ["/images/chauffeur-indian.jpg"],
  },
};

export default function BookingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Book a Driver", url: "/book" },
  ]);

  const serviceSchema = getServiceSchema();

  return (
    <>
      <JsonLd data={[breadcrumbSchema, serviceSchema]} />
      <BookPageClient />
    </>
  );
}
