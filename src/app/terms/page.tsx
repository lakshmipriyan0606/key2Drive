import type { Metadata } from "next";
import TermsPageClient from "./TermsPageClient";
import JsonLd from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Terms & Conditions | Cancellation & Tariff Policy | Key2Drive",
  },
  description:
    "Review the terms and conditions, cancellation policy, night allowances, and service guidelines for Key2Drive acting driver services in Tamil Nadu.",
  alternates: {
    canonical: "https://www.key2drivers.in/terms",
  },
  openGraph: {
    title: "Terms & Conditions | Cancellation & Tariff Policy | Key2Drive",
    description:
      "Review the terms and conditions, cancellation policy, night allowances, and service guidelines for Key2Drive acting driver services in Tamil Nadu.",
    url: "https://www.key2drivers.in/terms",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/chauffeur-indian.jpg",
        width: 1376,
        height: 768,
        alt: "Terms & Conditions | Key2Drive Acting Driver Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Cancellation & Tariff Policy | Key2Drive",
    description:
      "Review the terms and conditions, cancellation policy, night allowances, and service guidelines for Key2Drive acting driver services in Tamil Nadu.",
    images: ["/images/chauffeur-indian.jpg"],
  },
};

export default function TermsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Terms & Conditions", url: "/terms" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumbSchema]} />
      <TermsPageClient />
    </>
  );
}
