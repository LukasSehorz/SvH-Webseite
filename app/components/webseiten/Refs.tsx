/* S5. Zuerst die Uebersicht nach M8, danach die vier ausfuehrlichen
   Bloecke nach M2 und M3, abwechselnd Fenster links und Fenster rechts.

   Der Farbnebel je Projekt kommt aus dem jeweiligen Bild und ist stark
   abgesenkt, damit die vier Bloecke zusammengehoeren und trotzdem
   unterscheidbar bleiben. Sand fuer Brandhuber, Blau fuer World of
   Less, Amber fuer Taxi IZI, Gruen fuer Inn Natur. Alle vier sind so
   weit in Richtung unserer Palette gezogen, dass sie neben den blauen
   Nebeln der uebrigen Seite nicht als Fremdkoerper stehen. */
import Fade from "./Fade";
import RefWindow from "./RefWindow";
import { ExternalIcon } from "./Icons";
import s from "./webseiten.module.css";

type Projekt = {
  id: string;
  name: string;
  field: string;
  url: string;
  host: string;
  body: string;
  heroAlt: string;
  fullAlt: string;
};

/* Kern und Rand des Nebels je Projekt. Der Kern traegt den Ton aus dem
   Bild, der Rand zieht ihn zurueck in unsere Palette. */
const NEBEL: Record<string, [string, string]> = {
  brandhuber: ["#c2a077", "#7c6aff"],
  "world-of-less": ["#4f86d6", "#5b8cff"],
  "taxi-izi": ["#d3a13c", "#7c6aff"],
  innnatur: ["#5f9c74", "#7c6aff"],
};

export default function Refs({
  items,
  overviewNote,
  runNote,
}: Readonly<{
  items: readonly Projekt[];
  overviewNote: string;
  runNote: string;
}>) {
  return (
    <>
      {/* M8. Vier numerierte Karten als Uebersicht. Ein Klick springt zum
          ausfuehrlichen Block weiter unten. */}
      <div className={s.refGrid}>
        {items.map((p, i) => {
          const [kern] = NEBEL[p.id] ?? ["#5b8cff", "#7c6aff"];
          return (
            <Fade key={p.id} className={s.refCell} versatz={i * -0.015}>
              <a
                className={s.refCard}
                href={`#projekt-${p.id}`}
                aria-label={`${p.name}, ${p.field}. ${overviewNote}`}
              >
                <p className={s.refCardField}>{p.field}</p>
                <p className={s.refCardName}>{p.name}</p>

                <div className={s.refShot}>
                  <span
                    className={s.refShotMist}
                    style={{ ["--mist" as string]: kern }}
                  />
                  <span className={s.refShotFrame}>
                    <img
                      src={`/referenzen/${p.id}-hero.webp`}
                      alt={p.heroAlt}
                      width={1200}
                      height={750}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </div>

                <span className={s.refCardNum}>{String(i + 1).padStart(2, "0")}</span>
              </a>
            </Fade>
          );
        })}
      </div>

      {/* Die vier Bloecke. Ungerade Nummern tragen das Fenster links,
          gerade tragen es rechts. Auf dem Telefon faellt der Wechsel weg
          und der Abstand zwischen den Bloecken uebernimmt seine Rolle. */}
      {items.map((p, i) => {
        const [kern, rand] = NEBEL[p.id] ?? ["#5b8cff", "#7c6aff"];
        const gedreht = i % 2 === 1;
        return (
          <section
            key={p.id}
            id={`projekt-${p.id}`}
            className={`${s.refBlock} ${gedreht ? s.refBlockFlip : ""}`}
            aria-labelledby={`projekt-${p.id}-name`}
          >
            <div className={s.refStage}>
              <RefWindow
                id={p.id}
                host={p.host}
                url={p.url}
                heroAlt={p.heroAlt}
                fullAlt={p.fullAlt}
                mist={kern}
                mist2={rand}
                /* Der Hinweis steht nur am ersten Fenster. Viermal
                   derselbe Satz erklaert nichts mehr, und der Auftrag
                   sagt zu M4 ausdruecklich, dass der Durchlauf ohne
                   Erklaerung auskommt. */
                note={i === 0 ? runNote : ""}
              />
            </div>

            <div className={s.refInfo}>
              <p className={s.refField}>{p.field}</p>
              <h3 className={s.refName} id={`projekt-${p.id}-name`}>
                <a
                  className={s.refNameLink}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.name}
                </a>
              </h3>
              <p className={s.refBody}>{p.body}</p>
              <a
                className={s.refHost}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.host}
                <ExternalIcon size={14} />
              </a>
            </div>
          </section>
        );
      })}
    </>
  );
}
