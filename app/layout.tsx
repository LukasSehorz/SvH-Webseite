import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { meta } from "./copy";
import SmoothScroll from "./components/system/SmoothScroll";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "600"],
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["300", "400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://svh-consulting.de"),
  title: {
    default: meta.home.title,
    template: "%s — SVH Consulting",
  },
  description: meta.home.description,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "SVH Consulting",
    title: meta.home.title,
    description: meta.home.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} ${interTight.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
