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
  title: {
    default: "Key2Drive | Professional Acting Driver & Car Driver Services",
    template: "%s | Key2Drive",
  },
  description:
    "Key2Drive provides professional, background-verified personal car drivers for your car. Hourly acting drivers, full-day drivers, airport transfers, and outstation trips with zero surge.",
  keywords: [
    "acting driver",
    "call driver",
    "car driver",
    "personal driver",
    "driver for car",
    "hire driver",
    "airport transfer",
    "outstation driver",
    "corporate driver",
    "monthly driver",
    "Key2Drive",
  ],
  authors: [{ name: "Key2Drive Mobility Solutions" }],
  creator: "Key2Drive",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Key2Drive | Professional Acting Driver & Car Driver Services",
    description:
      "Professional, background-verified personal drivers for your car. Transparent hourly tariffs, 24/7 dispatch, and safe journey in your vehicle.",
    url: "/",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Key2Drive | Professional Acting Driver & Car Driver Services",
    description:
      "Professional, background-verified personal drivers for your car. Transparent hourly tariffs, 24/7 dispatch, and safe journey in your vehicle.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth font-sans h-full antialiased">
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
