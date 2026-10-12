import Image from "next/image";
import { Fragment } from "react";
import { aktuelles, ergebnisse } from "@/app/copy";
import { YouTubeLogo } from "@/components/b/UeberUns";
import { stufe } from "@/components/b/ui";

/*
 * Videoliste für /aktuelles im hellen Stil der Startseite (Karten wie im Abschnitt
 * „Einblicke in die KI-Welt“). Es wird nichts eingebettet: Das Vorschaubild liegt bei uns
 * (public/aktuelles), erst der Klick öffnet YouTube in einem neuen Fenster. So geht beim
 * Aufruf der Seite nichts an Google. Die ganze Karte ist klickbar (gestreckter Link am Titel).
 */

type Video = (typeof aktuelles.videos)[number];

/** Bindestrich-Wörter nicht am Bindestrich trennen („Praxis-Use“, „KI-Anwendung“). Text bleibt wortgleich. */
function NoBreak({ text }: Readonly<{ text: string }>) {
  return (
    <>
      {text.split(/(\S*\w-\w\S*)/g).map((w, i) =>
        i % 2 ? (
          <span key={i} className="vd-nb">
            {w}
          </span>
        ) : (
          <Fragment key={i}>{w}</Fragment>
        ),
      )}
    </>
  );
}

function PfeilRaus() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 16 16 8M9.5 8H16v6.5" />
    </svg>
  );
}

function Card({ v, lead = false }: Readonly<{ v: Video; lead?: boolean }>) {
  return (
    <article className={`vd b-karte${lead ? " vd--lead" : ""}`}>
      <span className="ak-bild vd-bild">
        <Image
          src={v.bild}
          alt={v.alt}
          fill
          sizes={lead ? "(max-width: 899px) calc(100vw - 40px), 640px" : "(max-width: 899px) calc(100vw - 40px), 380px"}
          quality={82}
          loading={lead ? "eager" : "lazy"}
          fetchPriority={lead ? "high" : "auto"}
        />
        <span className="ak-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        </span>
      </span>
      <div className="vd-text">
        <p className="vd-meta">
          {lead ? <span className="vd-chip">{aktuelles.latest}</span> : null}
          <time dateTime={v.datumIso}>{v.datum}</time>
        </p>
        <h2 className="vd-titel">
          <a className="vd-link" href={v.href} target="_blank" rel="noopener noreferrer">
            <NoBreak text={v.titel} />
            <span className="sr-only"> ({ergebnisse.newWindow})</span>
          </a>
        </h2>
        <p className="vd-body">
          <NoBreak text={v.body} />
        </p>
        <span className="vd-mehr" aria-hidden="true">
          {aktuelles.watch}
          <PfeilRaus />
        </span>
      </div>
    </article>
  );
}

export default function Videos() {
  const [first, ...rest] = aktuelles.videos;
  return (
    <section className="vds" aria-label={aktuelles.label}>
      <div className="sb-wrap">
        {first ? (
          <div data-rv="">
            <Card v={first} lead />
          </div>
        ) : null}

        {rest.length ? (
          <ul className="vd-grid">
            {rest.map((v, i) => (
              <li key={v.id} data-rv="" style={stufe(i)}>
                <Card v={v} />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="vd-fuss" data-rv="">
          <p className="vd-hinweis">{aktuelles.hint}</p>
          <a className="ak-yt" href={aktuelles.channel.href} target="_blank" rel="noopener noreferrer">
            <YouTubeLogo />
            {aktuelles.channel.label}
            <span className="sr-only"> ({ergebnisse.newWindow})</span>
          </a>
        </div>
      </div>
    </section>
  );
}
