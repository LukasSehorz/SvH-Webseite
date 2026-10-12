import Image from "next/image";
import { aktuelles } from "@/app/copy";
import { company } from "@/app/content";
import { aktuellesB, teamB } from "@/app/copy-b";
import { Grad, stufe } from "./ui";

/* Über uns: die zwei Gründer als helle Karten (Kartenart wie bei den Lösungen). Das Foto steht
   neben dem Namen statt als riesige Kachel; ohne Foto ein ruhiger Platzhalter mit Initialen.
   Getönter Grund: zwischen den weißen Lösungen und dem Masterplan wechselt so der Hintergrund (Runde 3).
   Handy: Foto klein neben Name und Rolle, Text darunter. Ab 1100 px: Foto links über die ganze Höhe. */
export function UeberUns() {
  return (
    <section className="sb sb--tint uu" id="ueber-uns" aria-labelledby="ueber-uns-titel">
      <div className="sb-wrap">
        <div className="b-kopf b-kopf--mitte" data-rv="">
          <p className="b-label">{teamB.label}</p>
          <h2 className="b-h2" id="ueber-uns-titel">
            <Grad text={teamB.titel} />
          </h2>
        </div>

        <ul className="uu-gruender">
          {teamB.people.map((p, i) => (
            <li key={p.name} className="uu-karte" data-rv="" style={stufe(i)}>
              <div className="uu-foto">
                {p.foto ? (
                  <Image src={p.foto} alt={p.name} fill sizes="(max-width: 1099px) 96px, 160px" />
                ) : (
                  <div className="uu-foto-platzhalter" aria-hidden="true">
                    <span className="uu-foto-initialen">{p.initials}</span>
                    <span className="uu-foto-hinweis">{teamB.fotoFolgt}</span>
                  </div>
                )}
              </div>
              <div className="uu-kopf">
                <h3 className="uu-name">{p.name}</h3>
                <p className="uu-rolle">{p.rolle}</p>
                {p.linkedin ? (
                  <a className="uu-li" href={p.linkedin} target="_blank" rel="noopener noreferrer" aria-label={teamB.linkedinLabel(p.name)}>
                    <LinkedInLogo />
                    {teamB.linkedin}
                  </a>
                ) : null}
              </div>
              <div className="uu-text">
                {p.text.map((t) => (
                  <p key={t} className="uu-absatz">
                    {t}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function YouTubeLogo() {
  return (
    <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
      <path d="M27.4 3.1A3.5 3.5 0 0 0 25 .6C22.8 0 14 0 14 0S5.2 0 3 .6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9A3.5 3.5 0 0 0 3 19.4c2.2.6 11 .6 11 .6s8.8 0 11-.6a3.5 3.5 0 0 0 2.4-2.5c.6-2.2.6-6.9.6-6.9s0-4.7-.6-6.9z" fill="#FF0000" />
      <path d="M11.2 14.3L18.5 10l-7.3-4.3z" fill="#fff" />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path d="M7.1 9.5H4.6V19h2.5zM5.9 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM19.4 13.6c0-2.6-1.4-4.3-3.7-4.3-1.3 0-2.2.7-2.6 1.4V9.5h-2.4V19h2.5v-4.9c0-1.3.4-2.5 1.9-2.5s1.7 1.4 1.7 2.6V19h2.6z" fill="#fff" />
    </svg>
  );
}

/* Aktuelles: Janniks Videos (führen zu YouTube, also von der Seite weg). Seit Runde 3 hinter den Fragen,
   direkt vor dem Abschluss: vor dem Angebot gibt es keinen Ausgang mehr. Kompaktes getöntes Band
   zwischen den weißen Fragen und dem weißen Abschluss: die zwei neuesten Videos (Liste aus Variante A)
   als weiße Karten und ein leiser Link zum Kanal.
   Handy: Videos als flache Zeilen (Bild links, Titel rechts), der Kanal-Link darunter.
   Ab 1000 px: Text und Kanal-Link links, Videos rechts. */
export function Aktuelles() {
  const videos = aktuelles.videos.slice(0, 2);
  return (
    <section className="sb sb--tint ak-band" id="aktuelles" aria-labelledby="aktuelles-titel">
      <div className="sb-wrap">
        <div className="ak-kasten" data-rv="">
          <div className="ak-kopf">
            <p className="b-label">{aktuellesB.label}</p>
            <h2 className="ak-h2" id="aktuelles-titel">
              <Grad text={aktuellesB.title} />
            </h2>
            <p className="ak-lead">{aktuellesB.text}</p>
          </div>

          <ul className="ak-liste">
            {videos.map((v) => (
              <li key={v.id}>
                <a className="ak-zeile" href={v.href} target="_blank" rel="noopener noreferrer">
                  <span className="ak-bild">
                    <Image src={v.bild} alt={v.alt} fill sizes="(max-width: 699px) 132px, (max-width: 999px) 45vw, 320px" />
                    <span className="ak-play" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                  <span className="ak-body">
                    <time className="ak-datum" dateTime={v.datumIso}>
                      {v.datum}
                    </time>
                    <span className="ak-titel">{v.titel}</span>
                    <span className="ak-mehr">{aktuellesB.ansehen}</span>
                    <span className="sr-only">{aktuellesB.neuesFenster}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="ak-mehr-link">
            <a className="ak-link" href={company.youtube} target="_blank" rel="noopener noreferrer">
              <YouTubeLogo />
              {aktuellesB.alle}
              <span className="sr-only">{aktuellesB.neuesFensterKurz}</span>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
