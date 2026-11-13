import type { Metadata } from "next";
import TariffsPageClient from "./TariffsPageClient";
import JsonLd from "@/components/seo/JsonLd";
import { getServiceSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Acting Driver Charges & Tariffs in Tamil Nadu | Key2Drive",
  },
  description:
    "Explore Key2Drive acting driver pricing and service charges. Check applicable driver booking rates and plan your journey.",
  alternates: {
    canonical: "https://www.key2drivers.in/tariffs",
  },
  openGraph: {
    title: "Acting Driver Charges & Tariffs in Tamil Nadu | Key2Drive",
    description:
      "Explore Key2Drive acting driver pricing and service charges. Check applicable driver booking rates and plan your journey.",
    url: "https://www.key2drivers.in/tariffs",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/tariff-airport-indian.jpg",
        width: 1200,
        height: 630,
        alt: "Acting Driver Charges & Tariffs in Tamil Nadu | Key2Drive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acting Driver Charges & Tariffs in Tamil Nadu | Key2Drive",
    description:
      "Explore Key2Drive acting driver pricing and service charges. Check applicable driver booking rates and plan your journey.",
    images: ["/images/tariff-airport-indian.jpg"],
  },
};

export default function TariffsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Tariffs", url: "/tariffs" },
  ]);

  const serviceSchema = getServiceSchema();

  return (
    <>
      <JsonLd data={[breadcrumbSchema, serviceSchema]} />
      <TariffsPageClient />
    </>
  );
}
