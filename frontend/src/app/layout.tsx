import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PWAInstall } from "@/components/pwa-install";
import { OfflineIndicator } from "@/components/offline-indicator";

export const metadata: Metadata = {
  title: "Play Ethiopia - Football Infrastructure Platform",
  description: "Book football fields, watch match replays, and follow your favorite stadiums in Ethiopia",
  keywords: ["football", "ethiopia", "booking", "stadium", "sports", "replay", "pwa"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PlayEth",
  },
  formatDetection: {
    telephone: true,
    email: false,
  },
  openGraph: {
    title: "Play Ethiopia",
    description: "Ethiopia's #1 Football Infrastructure Platform",
    type: "website",
    locale: "en_US",
    siteName: "Play Ethiopia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#22c55e",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="msapplication-TileColor" content="#030712" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-gray-950 text-white overscroll-none">
        <OfflineIndicator />
        <AuthProvider>
          <Header />
          <main className="min-h-screen pb-16 lg:pb-0">
            {children}
          </main>
          <MobileNav />
          <PWAInstall />
        </AuthProvider>
      </body>
    </html>
  );
}
