import Image from "next/image";
import type { ReactNode } from "react";
import { workshopB } from "@/app/copy-b";
import { Grad } from "./ui";

/* Geld-zurück-Garantie im Workshop-Ablauf (Idee aus Variante A, jetzt hell):
   links ein Siegel wie eine Prägung (feine Verlaufs-Ringe, Ringschrift, SvH-Monogramm),
   daneben Überschrift und Text, darunter drei Schritte mit Zeichen statt Ziffern
   (Ziffern hießen in den Leistungen schon „Stufe 0–4“).
   Ohne JavaScript: Die Ringe zeichnen sich beim Einblenden (data-rv, styles/garantie-b.css), sonst steht alles fertig da. */

const g = workshopB.garantie;

const ZEICHEN: ReactNode[] = [
  // Ziel festlegen: Zielscheibe
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.6" fill="url(#b-verlauf)" />
  </>,
  // Umsetzen und messen: Kurve nach oben
  <>
    <path d="M4 19.5h16" />
    <path d="M5.5 15.5l4-4.5 3.5 3 5.5-6.5" />
    <path d="M14.5 7.5h4v4" />
  </>,
  // Ziel verfehlt? Geld zurück: Pfeil zurück
  <>
    <path d="M9 7.5L5 11.5l4 4" />
    <path d="M5 11.5h9.5a4.5 4.5 0 0 1 0 9H12" />
  </>,
];

/** Siegel: Ringe und Ringschrift als SVG, Monogramm als Bild darüber */
function Siegel() {
  // Ringschrift einmal rundherum; das Leerzeichen am Ende schließt den Kreis sauber
  const ring = g.siegel.toUpperCase().replace(/\s+$/, " ");
  return (
    <div className="gb-siegel" aria-hidden="true">
      <svg className="gb-siegel-svg" viewBox="0 0 300 300" focusable="false">
        <defs>
          <linearGradient id="gb-verlauf" gradientUnits="userSpaceOnUse" x1="20" y1="30" x2="280" y2="270">
            <stop offset="0" stopColor="#3f74ff" />
            <stop offset="0.55" stopColor="#6a55ff" />
            <stop offset="1" stopColor="#8c6dff" />
          </linearGradient>
          <radialGradient id="gb-flaeche" cx="0.5" cy="0.38" r="0.62">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f1f3ff" />
          </radialGradient>
          <path id="gb-pfad" d="M150 150 m -110 0 a 110 110 0 1 1 220 0 a 110 110 0 1 1 -220 0" />
        </defs>
        <circle cx="150" cy="150" r="146" fill="url(#gb-flaeche)" />
        <circle className="gb-ring gb-ring--aussen" pathLength={1} cx="150" cy="150" r="143" transform="rotate(-90 150 150)" />
        <circle className="gb-ring" pathLength={1} cx="150" cy="150" r="135" transform="rotate(-90 150 150)" />
        <circle className="gb-ring" pathLength={1} cx="150" cy="150" r="98" transform="rotate(-90 150 150)" />
        <circle className="gb-ring gb-ring--fein" pathLength={1} cx="150" cy="150" r="90" transform="rotate(-90 150 150)" />
        {/* feine Teilstriche zwischen den inneren Ringen (ein Kreis mit Strichmuster) */}
        <circle className="gb-striche" cx="150" cy="150" r="94" pathLength={96} />
        <text className="gb-ringschrift">
          <textPath href="#gb-pfad" startOffset="0" textLength={688} lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </svg>
      <Image className="gb-monogramm" src="/logo/svh-bild-navy.webp" alt="" width={480} height={780} sizes="72px" />
    </div>
  );
}

export default function Garantie() {
  return (
    <div className="gb" id="garantie" data-rv="">
      <Siegel />
      <div className="gb-kopf">
        <p className="b-label">{g.label}</p>
        <h3 className="gb-titel">
          <Grad text={g.titel} />
        </h3>
      </div>
      <p className="gb-text">{g.text}</p>
      <ol className="gb-schritte">
        {g.schritte.map((s, i) => (
          <li key={s.titel} className="gb-schritt">
            <span className="gb-zeichen" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="url(#b-verlauf)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                {ZEICHEN[i]}
              </svg>
            </span>
            <div>
              <h4 className="gb-schritt-titel">{s.titel}</h4>
              <p className="gb-schritt-text">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
