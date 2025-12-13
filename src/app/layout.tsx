import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { routing } from "@/i18n/routing";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaza Risk Analizi - Güvenli Sürüş Asistanı",
  description:
    "Yol koşulları, hava durumu ve trafik bilgilerini analiz ederek kaza risk seviyesini tahmin edin. AI destekli güvenlik değerlendirmesi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={routing.defaultLocale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
