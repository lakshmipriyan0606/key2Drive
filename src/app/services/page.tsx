import type { Metadata } from "next";
import ServicesPageClient from "./ServicesPageClient";
import JsonLd from "@/components/seo/JsonLd";
import { getServiceSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Acting Driver Services | Hourly, Daily & Outstation | Key2Drive",
  },
  description:
    "Explore Key2Drive acting driver services, including hourly, full-day and outstation driving. Find a suitable driver for your car.",
  alternates: {
    canonical: "https://www.key2drivers.in/services",
  },
  openGraph: {
    title: "Acting Driver Services | Hourly, Daily & Outstation | Key2Drive",
    description:
      "Explore Key2Drive acting driver services, including hourly, full-day and outstation driving. Find a suitable driver for your car.",
    url: "https://www.key2drivers.in/services",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/chauffeur-indian.jpg",
        width: 1376,
        height: 768,
        alt: "Acting Driver Services | Hourly, Daily & Outstation | Key2Drive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acting Driver Services | Hourly, Daily & Outstation | Key2Drive",
    description:
      "Explore Key2Drive acting driver services, including hourly, full-day and outstation driving. Find a suitable driver for your car.",
    images: ["/images/chauffeur-indian.jpg"],
  },
};

export default function ServicesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
  ]);

  const serviceSchema = getServiceSchema();

  return (
    <>
      <JsonLd data={[breadcrumbSchema, serviceSchema]} />
      <ServicesPageClient />
    </>
  );
}
