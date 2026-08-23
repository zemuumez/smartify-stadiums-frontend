import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  title: "ET Smart Fields - Smart Football Infrastructure",
  description: "Book football fields, watch match replays, and connect with smart stadiums across Ethiopia",
  keywords: ["football", "ethiopia", "booking", "stadium", "sports", "replay", "smart fields"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ETSF",
  },
  openGraph: {
    title: "ET Smart Fields",
    description: "Ethiopia's #1 Smart Football Infrastructure Platform",
    type: "website",
    locale: "en_US",
    siteName: "ET Smart Fields",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#16a34a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 overscroll-none">
        <AuthProvider>
          <Header />
          <main className="min-h-screen pb-20 lg:pb-0">
            {children}
          </main>
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
