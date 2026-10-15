import { headers } from 'next/headers';
import { tenantFromHost } from '@/services/tenant-routing';
import { LanguageProvider, LanguageSwitcher } from '@/i18n/provider';
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/lib/theme-provider";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  title: "ET Smart Fields - Book Sports Fields in Ethiopia",
  description: "Find, reserve and pay for football, basketball, volleyball, badminton, tennis and futsal fields across Ethiopia in under 2 minutes.",
  keywords: ["football", "basketball", "volleyball", "badminton", "tennis", "futsal", "ethiopia", "booking", "stadium", "sports"],
  icons: {
    icon: [
      { url: "/logo/et-smart-fields-icon.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/logo/et-smart-fields-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo/et-smart-fields-logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
    images: [
      {
        url: "/logo/et-smart-fields-logo.png",
        width: 1200,
        height: 630,
        alt: "ET Smart Fields",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ET Smart Fields",
    description: "Ethiopia's #1 Smart Football Infrastructure Platform",
    images: ["/logo/et-smart-fields-logo.png"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = (await headers()).get('host') || '';
  const tenant = tenantFromHost(host, process.env.NEXT_PUBLIC_ROOT_DOMAIN || '');
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo/et-smart-fields-icon.jpg" sizes="192x192" />
        <link rel="apple-touch-icon" href="/logo/et-smart-fields-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Prevent FOUC - set dark class before React loads */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('etsf-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased overscroll-none" style={{ backgroundColor: '#f4f3ef', color: '#111111' }}>
        <LanguageProvider><ThemeProvider>
          <AuthProvider>
            {!tenant && <Header />}
            <div className="min-h-screen pb-20 lg:pb-0">
              {children}
            </div>
            {!tenant && <MobileNav />}
          </AuthProvider>
        </ThemeProvider><LanguageSwitcher /></LanguageProvider>
      </body>
    </html>
  );
}
