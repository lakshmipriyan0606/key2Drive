/**
 * Schema.org JSON-LD Structured Data Generators for Key2Drive
 * Target: Tamil Nadu, India
 * Path: src/lib/seo/schema.ts
 */

const BASE_URL = "https://www.key2drivers.in";
const BRAND_IMAGE = `${BASE_URL}/images/chauffeur-indian.jpg`;

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Key2Drive Mobility Solutions",
    alternateName: "Key2Drive",
    url: BASE_URL,
    logo: BRAND_IMAGE,
    image: BRAND_IMAGE,
    email: "key2drivers@gmail.com",
    telephone: "+917200132709",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-72001-32709",
        contactType: "customer service",
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Tamil Nadu",
        },
        availableLanguage: ["English", "Tamil"],
      },
    ],
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Key2Drive",
    alternateName: "Key2Drive Acting Driver Services",
    description:
      "Professional acting driver and call driver services across Tamil Nadu. Book experienced drivers for your personal car with Key2Drive.",
    inLanguage: "en-IN",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
  };
}

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${BASE_URL}/#localbusiness`,
    name: "Key2Drive Acting Driver Services",
    image: BRAND_IMAGE,
    url: BASE_URL,
    telephone: "+917200132709",
    email: "key2drivers@gmail.com",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Saai Avenue, Sekar Nagar, New Perungalathur",
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      postalCode: "600063",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 12.9056,
      longitude: 80.0844,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Tamil Nadu",
      },
      {
        "@type": "City",
        name: "Chennai",
      },
    ],
    parentOrganization: {
      "@id": `${BASE_URL}/#organization`,
    },
  };
}

export function getServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BASE_URL}/#service`,
    name: "Acting Driver Service in Tamil Nadu",
    serviceType: "Acting Driver and Call Driver Services for Personal Cars",
    provider: {
      "@id": `${BASE_URL}/#organization`,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Tamil Nadu",
    },
    description:
      "Professional acting driver and call driver services across Tamil Nadu. Book background-verified drivers for hourly city errands, full day travel, airport transfers, and outstation trips in your personal car.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Acting Driver Services Catalog",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Hourly Acting Driver",
            description:
              "Convenient hourly acting driver to drive your personal car with zero parking or traffic stress.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Full Day Driver",
            description:
              "Dedicated personal driver for your entire day with unlimited city stops across the city.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Airport Transfer Driver",
            description:
              "On-time doorstep pickup and airport terminal transfer with flight tracking.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Outstation Acting Driver",
            description:
              "Experienced long-distance driver for weekend getaways and intercity highway travel.",
          },
        },
      ],
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

