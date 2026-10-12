import Image from "next/image";
import { Fragment } from "react";
import { cta } from "@/app/copy";
import { kundenB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { LOGOS } from "./logos";
import KundenKarussell from "./KundenKarussell";
import MehrText from "./MehrText";
import { GoogleG, Grad, Sterne, stufe } from "./ui";

/* Kunden (Beweis direkt nach den Leistungen):
   1. drei Ergebnis-Karten mit großer Zahl (was es gebracht hat, was wir gebaut haben),
   2. echte Google-Bewertungen als endloses Karussell in einer Reihe (KundenKarussell),
   3. kurze Zeile und Knopf zum Workshop.
   Bewertungskarte: oben das Firmenlogo, darunter die Bewertung (wortgetreu), unten kurz, was wir umgesetzt haben
   (fehlt die Angabe, entfällt der Block). Desktop drei Karten, Tablet zwei, Handy eine (die nächste schaut hinein). */

type Ergebnis = (typeof kundenB.ergebnisse)[number];

/** Zahl der Ergebnis-Karte: „bis zu“ klein davor, „→“ für Screenreader als Wort */
function Zahl({ text }: { text: string }) {
  const vor = text.match(/^bis zu\s+/)?.[0];
  const teile = (vor ? text.slice(vor.length) : text).split(/\s*→\s*/);
  return (
    <p className="kd-erg-zahl">
      {vor ? <span className="kd-erg-vor">{vor.trim()} </span> : null}
      {teile.map((teil, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <>
              {" "}
              <span className="kd-erg-pfeil" aria-hidden="true">
                →
              </span>
              <span className="sr-only">{kundenB.pfeil}</span>{" "}
            </>
          ) : null}
          <span className="kd-erg-nw">{teil}</span>
        </Fragment>
      ))}
    </p>
  );
}

/** Firma der Ergebnis-Karte: Logo, sonst ein ruhiges Gebäude-Zeichen mit dem Namen */
function ErgebnisFirma({ e }: { e: Ergebnis }) {
  const logo = e.logo ? LOGOS[e.logo] : undefined;
  if (logo)
    return (
      <div className="kd-erg-firma">
        <Image className={`kd-erg-logo kd-erg-logo--${e.logo}`} src={logo.src} alt={e.firma} width={logo.w} height={logo.h} sizes="140px" />
      </div>
    );
  return (
    <div className="kd-erg-firma">
      <span className="kd-erg-zeichen" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="url(#b-verlauf)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20V6.5L12 3v17M12 20V9l8 3v8M2.5 20h19M7.5 8.5h1M7.5 12h1M7.5 15.5h1M15.5 14h1M15.5 17h1" />
        </svg>
      </span>
      <span className="kd-erg-name">{e.firma}</span>
    </div>
  );
}

/** Logo oben in der Bewertungskarte: Bilddatei, Schriftzug (Betthupferl) oder neutral ohne Logo */
function FirmenLogo({ logo, firma, href }: { logo: string; firma: string; href: string }) {
  const inhalt =
    logo === "betthupferl" ? (
      <span className="kd-wortmarke">Betthupferl</span>
    ) : logo && LOGOS[logo] ? (
      <Image src={LOGOS[logo].src} alt={firma} width={LOGOS[logo].w} height={LOGOS[logo].h} sizes="180px" />
    ) : (
      <span className="kd-ohne-logo">{firma || "Kundenstimme"}</span>
    );
  const klasse = `kd-logo${logo === "taxiizi" ? " kd-logo--dunkel" : ""}`;
  return href ? (
    <a className={klasse} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${firma} (öffnet in neuem Fenster)`}>
      {inhalt}
    </a>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

export default function Kunden() {
  const karten = kundenB.bewertungen.map((b) => (
    <Fragment key={b.name}>
      <FirmenLogo logo={b.logo} firma={b.firma} href={b.href} />
      <figure className="kd-bewertung">
        <div className="kd-bewertung-kopf">
          <span className="kd-avatar" aria-hidden="true">
            {b.name.trim().charAt(0).toUpperCase()}
          </span>
          <span>
            <span className="kd-name">{b.name}</span>
            <span className="kd-datum">
              {kundenB.google} · {b.datum}
            </span>
          </span>
          <GoogleG size={18} />
        </div>
        <Sterne n={b.sterne} />
        <MehrText text={b.text} weiter={kundenB.weiter} weniger={kundenB.weniger} />
      </figure>
      {b.umgesetzt ? (
        <div className="kd-umgesetzt">
          <p className="kd-umgesetzt-label">{kundenB.umgesetzt}</p>
          <p className="kd-umgesetzt-text">{b.umgesetzt}</p>
        </div>
      ) : null}
    </Fragment>
  ));

  return (
    <section className="sb sb--tint" id="kunden" aria-labelledby="kunden-titel">
      <div className="sb-wrap">
        <div className="b-kopf b-kopf--mitte" data-rv="">
          <p className="b-label">{kundenB.label}</p>
          <h2 className="b-h2" id="kunden-titel">
            <Grad text={kundenB.titel} />
          </h2>
          <p className="b-lead">{kundenB.text}</p>
        </div>

        {/* Ergebnisse: die stärksten Zahlen zuerst */}
        <ul className="kd-erg-liste">
          {kundenB.ergebnisse.map((e, i) => (
            <li key={e.firma} className="kd-erg" data-rv="" style={stufe(i)}>
              <Zahl text={e.zahl} />
              <div className="kd-erg-zeile">
                <p className="kd-erg-einheit">{e.einheit}</p>
                <ErgebnisFirma e={e} />
              </div>
              <div className="kd-erg-gebaut">
                <p className="kd-erg-label">{kundenB.gebaut}</p>
                <p className="kd-erg-text">{e.gebaut}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Übergang zu den Bewertungen: Schnitt auf Google */}
        <div className="kd-schnitt-zeile" data-rv="">
          <a className="kd-schnitt" href={kundenB.profil} target="_blank" rel="noopener noreferrer">
            <GoogleG />
            <span className="kd-schnitt-zahl">{kundenB.schnitt}</span>
            <Sterne n={5} />
            <span className="kd-schnitt-anzahl">{kundenB.anzahl}</span>
          </a>
        </div>

        {/* ohne JavaScript: ganze Texte und eine waagerecht scrollbare Reihe (alle fünf Karten erreichbar) */}
        <noscript>
          <style>
            {".kd-text[data-zu]{display:block;-webkit-line-clamp:unset;overflow:visible}" +
              ".kd-fenster{overflow-x:auto!important;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;padding-block:4px 32px;margin-block:-4px -32px}" +
              ".kd-karte{scroll-snap-align:start}.kd-steuerung{display:none!important}"}
          </style>
        </noscript>
        <KundenKarussell
          karten={karten}
          bereich={kundenB.bereich}
          zurueck={kundenB.zurueck}
          vor={kundenB.vor}
          positionen={kundenB.bewertungen.map((_, i) => kundenB.position(i + 1, kundenB.bewertungen.length))}
        />

        <p className="kd-alle" data-rv="">
          <a className="b-textlink" href={kundenB.profil} target="_blank" rel="noopener noreferrer">
            {kundenB.profilLink}
          </a>
        </p>

        <div className="kd-ende" data-rv="">
          <p className="kd-ende-zeile">{kundenB.ctaZeile}</p>
          <Cta href="#termin">{cta.main}</Cta>
        </div>
      </div>
    </section>
  );
}
