import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SonnerToaster from "@/components/ui/SonnerToaster";

// Primary Heading Font: Manrope (400, 500, 600, 700, 800)
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

// Body and UI Font: Inter (400, 500, 600, 700)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#11243D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Key2Drive | Premium Chauffeur & Professional Driver Services",
    template: "%s | Key2Drive",
  },
  description:
    "Key2Drive provides professional, background-verified personal chauffeurs for your car. Hourly drivers, full-day chauffeurs, airport transfers, and outstation trips with zero surge.",
  keywords: [
    "chauffeur",
    "acting driver",
    "personal driver",
    "hire driver",
    "airport transfer",
    "outstation driver",
    "corporate chauffeur",
    "luxury car driver",
    "Key2Drive",
  ],
  authors: [{ name: "Key2Drive Mobility Solutions" }],
  creator: "Key2Drive",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Key2Drive | Premium Chauffeur & Professional Driver Services",
    description:
      "Professional, background-verified personal chauffeurs for your car. Transparent hourly tariffs, 24/7 dispatch, and luxury mobility.",
    url: "/",
    siteName: "Key2Drive",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Key2Drive | Premium Chauffeur & Professional Driver Services",
    description:
      "Professional, background-verified personal chauffeurs for your car. Transparent hourly tariffs, 24/7 dispatch, and luxury mobility.",
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
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} font-sans h-full antialiased`}
    >
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

        {/* Emil Kowalski Sonner Toast Notification Center */}
        <SonnerToaster />
      </body>
    </html>
  );
}
