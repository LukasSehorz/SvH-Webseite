import Image from "next/image";
import { cta } from "@/app/copy";
import { heroB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { GoogleG, Grad, Haken, Sterne } from "./ui";

/* Hero: Kopf von oben nach unten wie bei andreasbaulig.de: kleine Zeile für die Zielgruppe,
   Überschrift, Unterzeile, darunter das Vertrauenssiegel (5,0 Sterne bei Google, Link aufs Profil).
   Darunter links das Video, rechts vier Haken mit dem Knopf.
   Zielgruppe, Überschrift, Unterzeile und Siegel stehen sofort da (keine Einblendung, schnelles LCP);
   nur Video, Haken und Knopf gleiten beim Laden nacheinander herein (animation.css).
   Optional im Hintergrund ein stark ausgeblichenes Foto der Gründer (gibt Tiefe, lenkt nicht ab). */

export default function Hero() {
  return (
    <section className="hb" aria-labelledby="hb-titel">
      {heroB.hintergrund ? (
        <div className="hb-bg" aria-hidden="true">
          <Image src={heroB.hintergrund} alt="" fill priority sizes="100vw" />
        </div>
      ) : null}
      <div className="shell hb-inhalt">
        <div className="hb-kopf">
          <p className="hb-ziel">{heroB.zielgruppe}</p>
          <h1 id="hb-titel" className="hb-h1">
            <Grad text={heroB.h1} />
          </h1>
          <p className="hb-sub">{heroB.sub}</p>
          {/* Tippfläche 44 px hoch, die sichtbare Pille darin ist schlanker (::before) */}
          <a className="hb-google" href={heroB.google.href} target="_blank" rel="noopener noreferrer" aria-label={heroB.google.label}>
            <GoogleG size={17} />
            <span className="hb-google-zahl">{heroB.google.schnitt}</span>
            <Sterne n={5} size={14} className="hb-google-sterne" deko />
            <span className="hb-google-text">
              <span className="hb-google-wo">{heroB.google.text} · </span>
              {heroB.google.anzahl}
            </span>
          </a>
        </div>

        <div className="hb-grid">
          {/* Platzhalter, bis das Erklärvideo da ist */}
          <figure className="hb-video" aria-label={`${heroB.video.titel} (${heroB.video.platzhalter})`}>
            <div className="hb-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            </div>
            <figcaption className="hb-video-cap">
              <span className="hb-video-titel">{heroB.video.titel}</span>
              <span className="hb-video-tag">{heroB.video.platzhalter}</span>
            </figcaption>
          </figure>

          <div className="hb-text">
            <ul className="hb-punkte">
              {heroB.punkte.map((p) => (
                <li key={p}>
                  <Haken size={26} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="hb-cta">
              <Cta href="#termin">{cta.main}</Cta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
