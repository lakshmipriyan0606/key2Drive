import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SonnerToaster from "@/components/ui/SonnerToaster";
import FloatingContactBar from "@/components/ui/FloatingContactBar";
import VisitorTracker from "@/components/analytics/VisitorTracker";

export const viewport: Viewport = {
  themeColor: "#11243D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.key2drivers.in"),
  applicationName: "Key2Drive",
  title: {
    default: "Acting Driver Service in Tamil Nadu | Key2Drive",
    template: "%s | Key2Drive",
  },
  description:
    "Professional acting driver and call driver services across Tamil Nadu. Book experienced drivers for your personal car with Key2Drive.",
  authors: [{ name: "Key2Drive Mobility Solutions" }],
  creator: "Key2Drive Mobility Solutions",
  publisher: "Key2Drive",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
  verification: {
    google: [
      "eU7vEXGN7UcHUyW0YTa711iVcarTTPqILCLkss7JWJ0",
      "bSPuOuFh4w3lG5g4PZulgojtRV65Gp-u3AwpJIo8PY0",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-L9W9T6354J";

  return (
    <html lang="en" className="scroll-smooth font-sans h-full antialiased">
      <head>
        {/* Google Analytics GA4 (gtag.js) in <head> for Google Search Console Verification & Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        />
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-brand-warm-bg text-brand-text flex flex-col font-sans selection:bg-brand-orange/20 selection:text-brand-navy">
        {/* Accessible skip link for keyboard & assistive technology users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-brand-orange focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {/* Global Application Header */}
        <Header />

        {/* Main Semantic Landmark */}
        <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
          {children}
        </main>

        {/* Global Application Footer */}
        <Footer />

        {/* Global Sticky Call & WhatsApp Instant Action Dock */}
        <FloatingContactBar />

        {/* Emil Kowalski Sonner Toast Notification Center */}
        <SonnerToaster />

        {/* Real-time Unique Visitor & Action Tracker */}
        <VisitorTracker />
      </body>
    </html>
  );
}
