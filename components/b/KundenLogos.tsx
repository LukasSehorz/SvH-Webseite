import Image from "next/image";
import { logosB } from "@/app/copy-b";
import { LOGOS } from "./logos";

/* Logo-Kasten unter der Trust-Bar: fast volle Breite, helle Karte mit feinem Rand (wie die Lösungen).
   Reihenfolge der Logos wie in logosB (copy-b.ts).
   Jedes Logo führt zur Webseite des Kunden; dazu die Zahl der weiteren Projekte (35 − Logos). */

// Größter Platz, den ein Logo einnimmt (bausteine.css: höchstens 56 px hoch, Zelle höchstens ~150 px breit).
// Daraus „sizes“: der Browser lädt nur die Anzeigebreite × Pixeldichte (vorher lud z. B. Physio 2.560 px
// für 75 px Anzeige). width/height bleiben die Originalmaße und geben nur das Seitenverhältnis vor.
const MAX_H = 56;
const MAX_B = 150;
const anzeigeBreite = (w: number, h: number) => Math.round(Math.min(MAX_B, (MAX_H * w) / h));
export default function KundenLogos() {
  const weitere = logosB.gesamt - logosB.firmen.length;
  return (
    <section className="kl" aria-labelledby="kl-titel">
      <div className="kl-kasten" data-rv="">
        <p className="kl-titel" id="kl-titel">
          {logosB.label}
        </p>
        <ul className="kl-liste">
          {logosB.firmen.map((f) => {
            const l = LOGOS[f.id];
            return (
              <li key={f.id}>
                <a className="kl-logo" href={f.href} target="_blank" rel="noopener noreferrer" title={f.name}>
                  <Image src={l.src} alt={`${f.name} (${logosB.neuesFenster})`} width={l.w} height={l.h} sizes={`${anzeigeBreite(l.w, l.h)}px`} />
                </a>
              </li>
            );
          })}
          <li className="kl-mehr">{logosB.weitere(weitere)}</li>
        </ul>
      </div>
    </section>
  );
}
