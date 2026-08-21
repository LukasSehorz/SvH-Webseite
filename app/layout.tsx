import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://svh-consulting.de"),
  title: {
    default: "SVH Consulting | Automatisieren, Optimieren & Skalieren – mit KI",
    template: "%s — SVH Consulting",
  },
  description:
    "SVH Consulting baut KI-Automatisierungen und Agenten, übernimmt Social-Media-Marketing inklusive digitaler Werbe-Displays für lokale Betriebe und entwickelt Webseiten, die Anfragen bringen.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "SVH Consulting",
    title: "SVH Consulting | Automatisieren, Optimieren & Skalieren – mit KI",
    description:
      "KI-Automatisierung & Agenten, Marketing und Webseiten – aus einer Hand.",
    images: ["/img/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
