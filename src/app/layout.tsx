import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { initFirebase } from "@/lib/firebase/config";
import { I18nProvider } from "@/i18n/config";
import { es } from "date-fns/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediAPP - Sistema de Citas Médicas",
  description: "Plataforma para gestión de citas médicas",
};

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  // Forzar la inicialización de Firebase en el cliente
  initFirebase();

  return (
    <I18nProvider locale={es}>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </I18nProvider>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
