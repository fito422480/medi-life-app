import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { I18nProvider } from "@/i18n/config";
import getI18n from "../../i18n/getI18n"; // Adjusted the path to match the correct file location
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProviderEnhanced } from "@/lib/hooks/use-auth-enhanced";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getI18n(params.locale);

  return {
    title: {
      default: t("common.appName"),
      template: `%s | ${t("common.appName")}`,
    },
    description: t("landing.hero.subtitle"),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://mediagenda.com"
    ),
    keywords: [
      "medical appointments",
      "doctor scheduling",
      "healthcare platform",
      "telemedicine",
      "patient portal",
      "medical scheduling system",
    ],
    authors: [
      {
        name: "MediAgenda Team",
      },
    ],
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
    },
    openGraph: {
      type: "website",
      locale: params.locale,
      url: process.env.NEXT_PUBLIC_APP_URL,
      title: t("common.appName"),
      description: t("landing.hero.subtitle"),
      siteName: t("common.appName"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("common.appName"),
      description: t("landing.hero.subtitle"),
    },
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        es: "/es",
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const localeData = await getI18n(params.locale);

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider locale={localeData}>
            <AuthProviderEnhanced>
              {children}
              <Toaster closeButton position="top-right" />
              <SpeedInsights />
              <Analytics />
            </AuthProviderEnhanced>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
