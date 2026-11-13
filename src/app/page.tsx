import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import JsonLd from "@/components/seo/JsonLd";
import {
  getWebSiteSchema,
  getOrganizationSchema,
  getLocalBusinessSchema,
  getServiceSchema,
} from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Acting Driver Service in Tamil Nadu | Key2Drive",
  },
  description:
    "Professional acting driver and call driver services across Tamil Nadu. Book experienced drivers for your personal car with Key2Drive.",
  alternates: {
    canonical: "https://www.key2drivers.in",
  },
  openGraph: {
    title: "Acting Driver Service in Tamil Nadu | Key2Drive",
    description:
      "Professional acting driver and call driver services across Tamil Nadu. Book experienced drivers for your personal car with Key2Drive.",
    url: "https://www.key2drivers.in",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/chauffeur-indian.jpg",
        width: 1376,
        height: 768,
        alt: "Key2Drive Professional Acting Driver Services in Tamil Nadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acting Driver Service in Tamil Nadu | Key2Drive",
    description:
      "Professional acting driver and call driver services across Tamil Nadu. Book experienced drivers for your personal car with Key2Drive.",
    images: ["/images/chauffeur-indian.jpg"],
  },
};

export default function HomePage() {
  const schemas = [
    getWebSiteSchema(),
    getOrganizationSchema(),
    getLocalBusinessSchema(),
    getServiceSchema(),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <HomePageClient />
    </>
  );
}
