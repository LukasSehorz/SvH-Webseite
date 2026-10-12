import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { meta, nav } from "@/app/copy";
import { metaB } from "@/app/copy-b";
import { company } from "@/app/content";
import Navbar from "@/components/b/Navbar";
import Footer from "@/components/b/Footer";
import Reveal from "@/components/b/Reveal";
import FormDialog from "@/components/b/FormDialog";
import { SvgDefsB } from "@/components/b/ui";

/* Root-Layout der Seite (helles Design, ehemals „Variante B“). Leiste, Fußzeile und das
   Anmeldefenster liegen hier, damit jeder Knopf „Kostenlosen KI-Workshop sichern“ auf jeder
   Seite (auch Impressum, Aktuelles, 404) die Anmeldung öffnet, ohne die Seite zu verlassen. */

// Schriften werden von Next selbst ausgeliefert (keine Anfrage an Google), nur Zeichensatz „latin“
// (deckt ä, ö, ü, ß, € und Gedankenstriche ab). Vorgeladen wird nur die Schrift der H1 (Inter Tight):
// zwei Vorlade-Dateien à ~46 KB konkurrierten am Handy mit dem CSS ums erste Bild (LCP).
// Inter (Fließtext) lädt, sobald das CSS sie braucht. Bis dahin steht Arial mit angepassten Maßen da
// (adjustFontFallback, Standard bei next/font: size-adjust, ascent/descent), der Wechsel springt nicht.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600"], display: "swap", preload: false, adjustFontFallback: true });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", weight: ["400", "500", "600", "800"], display: "swap", adjustFontFallback: true });
// nur für den Schriftzug des Kunden Betthupferl (dessen Logo ist ein Schriftzug in Bodoni Moda, kursiv)
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", weight: "400", style: "italic", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: { default: metaB.title, template: `%s | ${company.name}` },
  description: metaB.description,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: company.name,
    title: metaB.title,
    description: metaB.description,
    url: `${company.url}/`,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: meta.ogAlt }],
  },
  twitter: { card: "summary_large_image", title: metaB.title, description: metaB.description, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior: Next schaltet das weiche Scrollen (globals.css) beim Seitenwechsel kurz ab,
    // damit eine neue Seite oben beginnt statt dorthin zu gleiten; Anker innerhalb einer Seite gleiten weiter
    <html lang="de" className={`${inter.variable} ${interTight.variable} ${bodoni.variable}`} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#inhalt">
          {nav.skip}
        </a>
        <SvgDefsB />
        <Navbar />
        {children}
        <Footer />
        <FormDialog />
        <Reveal />
      </body>
    </html>
  );
}
