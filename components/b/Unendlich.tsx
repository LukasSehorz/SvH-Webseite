import type { CSSProperties } from "react";
import { cta } from "@/app/copy";
import { leistungenB } from "@/app/copy-b";
import Cta from "@/components/system/Cta";
import { Grad, Pfeil, stufe } from "./ui";

/* „Unsere Leistungen“ 0–4 als Kapitelmarke: das Unendlichkeitszeichen steht auf einer dunklen Bühne
   (Vorbild: andreasbaulig.de), geschlossen, die vier Farben gehen fließend ineinander über.
   Seit Runde 3 ohne Neon-Schein: flaches Band mit feiner Glanzkante, wie ein Produktbild.
   Auf dem Band laufen die Stufen 1–4: 1 oben links, 2 unten rechts, 3 oben rechts, 4 unten links
   (so läuft das Band auch). Die 0 (KI-Workshop) sitzt als Start-Knopf auf der Kreuzung in der Mitte.
   Computer (ab 1100 px): die fünf Texte stehen frei rund um das Zeichen, Pfeile zeigen vom Band zu ihnen
   (1 oben links, 3 oben rechts, 4 unten links, 2 unten rechts, 0 mittig darunter).
   Kleinere Schirme: Karten in Lesereihenfolge 0 → 4 unter dem Zeichen (Handy untereinander, Tablet 0 oben und 2 × 2).
   Form: Lemniskate von Bernoulli, etwas höher gezogen. Alles wird auf dem Server berechnet. */

const W = 1000;
const H = 600;
const CX = W / 2;
const CY = H / 2;
const A = 420; // halbe Breite
const STRECK = 1.45; // Schleifen höher ziehen
const BAND = 86; // Bandbreite (Handy: dicker per CSS)
const N = 480; // Stützpunkte

// Beschriftung auf dem Band: am Computer und (größer) am Handy
// frei: Abstand zur Mitte (dort sitzt der Start-Knopf), luecke: zwischen Nummer und Wort
type Masse = { schrift: number; r: number; frei: number; luecke: number };
const GROSS: Masse = { schrift: 30, r: 19, frei: 100, luecke: 11 };
const KLEIN: Masse = { schrift: 40, r: 24, frei: 132, luecke: 13 };
const SPITZE = 40; // Mindestabstand zur Spitze einer Schleife

// Farben der vier Abschnitte (Markenfamilie Blau → Lila), weiße Schrift bleibt lesbar.
// Auch die Lösungs-Karten nutzen sie für ihre Stufen-Schilder (gleiche Farbe = gleiche Stufe).
export const STUFEN_FARBEN = ["#2f6bff", "#4f46e5", "#7c3aed", "#a855f7"];
const FARBEN = STUFEN_FARBEN;

type P = { x: number; y: number };

function punkt(t: number): P {
  const s = Math.sin(t);
  const c = Math.cos(t);
  const d = 1 + s * s;
  return { x: CX + (A * c) / d, y: CY + ((A * s * c) / d) * STRECK };
}

/* Das Band läuft von der linken Spitze (t = π) rückwärts:
   1 links oben → Mitte → 2 rechts unten → rechte Spitze → 3 rechts oben → Mitte → 4 links unten → zurück. */
const tVon = (g: number) => Math.PI - (g * Math.PI) / 2; // g ∈ [0, 4]

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h: string, a: number) => `rgba(${hex(h).join(",")},${a})`;
function mische(a: string, b: string, w: number) {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * w)).join(",")})`;
}
const weich = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
function farbeBei(g: number) {
  const k = Math.floor(g) % 4;
  return mische(FARBEN[k], FARBEN[(k + 1) % 4], weich(0.62, 1, g - Math.floor(g)));
}

const pfad = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");

// Kleine Stücke mit Farbverlauf entlang des Bandes (leicht überlappend: keine Haarlinien)
const STUECKE = Array.from({ length: N }, (_, i) => {
  const g0 = (i / N) * 4;
  const g1 = ((i + 1.6) / N) * 4;
  return { d: pfad([punkt(tVon(g0)), punkt(tVon((g0 + g1) / 2)), punkt(tVon(g1))]), farbe: farbeBei((g0 + g1) / 2) };
});
const UMRISS_PUNKTE = Array.from({ length: N + 1 }, (_, i) => punkt(tVon((i / N) * 4)));
const UMRISS = pfad(UMRISS_PUNKTE);
// Gesamtlänge des Bandes: für den Lichtimpuls, der endlos durch das Zeichen läuft
const UMFANG = UMRISS_PUNKTE.reduce((s, p, i) => (i ? s + Math.hypot(p.x - UMRISS_PUNKTE[i - 1].x, p.y - UMRISS_PUNKTE[i - 1].y) : 0), 0);
const IMPULS = UMFANG * 0.07; // Länge des Lichtimpulses
const KERN = IMPULS * 0.55; // heller Kern in seiner Mitte

function laengen(pts: P[]) {
  const l = [0];
  for (let i = 1; i < pts.length; i++) l.push(l[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return l;
}
function beiLaenge(pts: P[], l: number[], s: number): P {
  const i = Math.max(1, l.findIndex((v) => v >= s));
  const f = (s - l[i - 1]) / (l[i] - l[i - 1] || 1);
  return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f };
}

// 0 ist der Start in der Mitte, auf dem Band laufen nur 1–4
const START = leistungenB.teile.find((t) => t.nr === 0) ?? leistungenB.teile[0];
const STUFEN = leistungenB.teile.filter((t) => t.nr > 0).slice(0, 4);

const ABSCHNITTE = STUFEN.map((teil, k) => {
  const pts = Array.from({ length: 121 }, (_, i) => punkt(tVon(k + i / 120)));
  const lesbar = pts[pts.length - 1].x >= pts[0].x ? pts : [...pts].reverse(); // Schrift nie kopfüber
  const l = laengen(lesbar);
  const L = l[l.length - 1];
  const vonMitte = Math.hypot(lesbar[0].x - CX, lesbar[0].y - CY) < 1; // Lesrichtung beginnt an der Kreuzung
  // Scheitel der Schleife (höchster bzw. tiefster Punkt): dort liegt das Band am flachsten
  const ys = lesbar.map((q) => q.y);
  const scheitel = l[ys.indexOf(k === 0 || k === 2 ? Math.min(...ys) : Math.max(...ys))];
  // Wort mittig auf dem Scheitel, Nummer davor; an der Kreuzung Platz für den Start-Knopf lassen
  const beschriftung = (m: Masse) => {
    const breite = teil.kurz.length * m.schrift * 0.58;
    let wort = scheitel - breite / 2;
    const ende = vonMitte ? L - SPITZE : L - m.frei;
    const anfang = vonMitte ? m.frei : SPITZE;
    wort = Math.min(wort, ende - breite);
    wort = Math.max(wort, anfang + 2 * m.r + m.luecke);
    return { nummer: beiLaenge(lesbar, l, wort - m.luecke - m.r), wort, m };
  };
  return {
    teil,
    farbe: FARBEN[k],
    textPfad: pfad(lesbar),
    gross: beschriftung(GROSS),
    klein: beschriftung(KLEIN),
    id: `lm-${k}`,
  };
});

type Abschnitt = (typeof ABSCHNITTE)[number];

/* Pfeile (Computer): vom Scheitel jeder Schleife nach außen zu ihrem Text, dazu einer vom Start-Knopf
   nach unten zum Text der 0. Lage der Texte: 1 oben links, 2 unten rechts, 3 oben rechts, 4 unten links. */
const PFEILE = [
  ...STUFEN.map((_, k) => {
    const oben = k === 0 || k === 2;
    const links = k === 0 || k === 3;
    const m = punkt(tVon(k + 0.5));
    const sx = m.x + (links ? -26 : 26);
    const sy = m.y + (oben ? -(BAND / 2 + 8) : BAND / 2 + 8);
    const ex = sx + (links ? -62 : 62);
    const ey = sy + (oben ? -36 : 36);
    return `M${sx.toFixed(1)} ${sy.toFixed(1)}Q${(sx + (links ? -6 : 6)).toFixed(1)} ${ey.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }),
  `M${CX} ${CY + 66}C${CX - 10} ${CY + 130} ${CX + 10} ${H - 30} ${CX} ${H + 34}`,
];

function Beschriftung({ a, b, klasse }: { a: Abschnitt; b: Abschnitt["gross"]; klasse: string }) {
  return (
    <g className={klasse} style={{ fontSize: b.m.schrift } as CSSProperties}>
      <text className="um-band-text" dy="0.35em">
        <textPath href={`#${a.id}`} startOffset={b.wort.toFixed(1)}>
          {a.teil.kurz}
        </textPath>
      </text>
      <circle cx={b.nummer.x} cy={b.nummer.y} r={b.m.r} fill="#fff" />
      <text x={b.nummer.x} y={b.nummer.y} dy="0.36em" textAnchor="middle" className="um-nummer" fill={a.farbe} style={{ fontSize: b.m.r * 1.16 }}>
        {a.teil.nr}
      </text>
    </g>
  );
}

const ARIA = `Unendlichkeitszeichen. In der Mitte der Start: ${START.nr} ${START.titel}. Danach laufen vier Stufen im Kreis: ${STUFEN.map((t) => `${t.nr} ${t.kurz}`).join(", ")}.`;

function Zeichen() {
  return (
    <svg className="um-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ARIA}>
      <defs>
        {ABSCHNITTE.map((a) => (
          <path key={a.id} id={a.id} d={a.textPfad} />
        ))}
      </defs>

      <g className="um-band">
        {STUECKE.map((s, i) => (
          <path key={i} d={s.d} fill="none" stroke={s.farbe} strokeWidth={BAND} strokeLinecap="butt" strokeLinejoin="round" />
        ))}
      </g>
      <path d={UMRISS} className="um-glanz" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={BAND * 0.18} transform={`translate(0 ${-BAND * 0.22})`} />
      {/* Lichtimpuls, der das Band entlangläuft (zeigt: alles greift ineinander), ohne Weichzeichner */}
      {/* Zwei Schichten statt Weichzeichner: breit und leise außen, schmal und heller innen (mittig).
          Muster-Länge = Umfang, damit der Impuls nahtlos umläuft. */}
      <g className="um-impuls" style={{ "--l": UMFANG.toFixed(0) } as CSSProperties}>
        <path d={UMRISS} fill="none" stroke="#fff" strokeWidth={BAND * 0.46} strokeLinecap="round" strokeOpacity={0.4} style={{ strokeDasharray: `${IMPULS.toFixed(0)} ${(UMFANG - IMPULS).toFixed(0)}` }} />
        <path
          d={UMRISS}
          className="um-impuls-kern"
          fill="none"
          stroke="#fff"
          strokeWidth={BAND * 0.2}
          strokeLinecap="round"
          style={{ "--v": ((IMPULS - KERN) / 2).toFixed(0), strokeDasharray: `${KERN.toFixed(0)} ${(UMFANG - KERN).toFixed(0)}` } as CSSProperties}
        />
      </g>

      <g className="um-pfeile">
        <defs>
          <marker id="um-spitze" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10" fill="none" stroke="rgba(226,230,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {PFEILE.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgba(226,230,255,0.85)" strokeWidth="2.4" strokeLinecap="round" markerEnd="url(#um-spitze)" />
        ))}
      </g>

      {ABSCHNITTE.map((a) => (
        <g key={`b-${a.id}`}>
          <Beschriftung a={a} b={a.gross} klasse="um-lbl um-lbl--gross" />
          <Beschriftung a={a} b={a.klein} klasse="um-lbl um-lbl--klein" />
        </g>
      ))}

    </svg>
  );
}

type Teil = (typeof leistungenB.teile)[number];

// „E-Mails“ und „KI-…“ nicht am Bindestrich umbrechen (geschützter Bindestrich)
const festeBindestriche = (t: string) => t.replace(/\b(KI|E)-(?=\w)/g, "$1\u2011");

/** Karte einer Stufe: Nummer und Titel, ein Satz, „Einfach erklärt“. Nur die 0 hat einen Link. */
function Karte({ teil, farbe, d }: { teil: Teil; farbe?: string; d: number }) {
  const start = teil.nr === 0;
  const stil = {
    ...stufe(d),
    ...(farbe ? { "--f": farbe, "--f-weich": rgba(farbe, 0.16), "--f-text": mische(farbe, "#140c3c", 0.22) } : {}),
  } as CSSProperties;
  return (
    <li className={`um-karte um-karte--n${teil.nr}${start ? " um-karte--start" : ""}`} data-rv="" style={stil}>
      <h3 className="um-karte-kopf">
        <span className="um-karte-nr">
          <span className="sr-only">Stufe </span>
          {teil.nr}
        </span>
        <span className="um-karte-titel">{festeBindestriche(teil.titel)}</span>
        {start ? <span className="um-karte-marke">{leistungenB.start}</span> : null}
      </h3>
      <p className="um-karte-text">{festeBindestriche(teil.text)}</p>
      <p className="um-einfach">
        <strong>{leistungenB.einfachLabel}:</strong> {teil.einfach}
      </p>
      {start ? (
        <a className="um-mehr" href={leistungenB.startLink.href}>
          {leistungenB.startLink.text} <Pfeil size={16} />
        </a>
      ) : null}
    </li>
  );
}

export default function Unendlich() {
  return (
    <section className="sb sb--kompakt um" id="leistungen" aria-labelledby="leistungen-titel">
      <div className="sb-wrap um-wrap">
        <div className="b-kopf b-kopf--mitte um-kopf" data-rv="">
          <p className="b-label">{leistungenB.label}</p>
          <h2 className="b-h2" id="leistungen-titel">
            <Grad text={leistungenB.titel} />
          </h2>
          <p className="b-lead">{leistungenB.text}</p>
        </div>

        {/* Computer: Texte rund um das Zeichen, Pfeile zeigen hin. Kleinere Schirme: Karten darunter. */}
        <div className="um-grid">
        <div className="um-zeichen" data-rv="">
          <Zeichen />
          {/* Start-Knopf auf der Kreuzung: hier steigt man ein */}
          <span className="um-start" aria-hidden="true">
            <span className="um-start-nr">{START.nr}</span>
            <span className="um-start-wort">{leistungenB.start}</span>
          </span>
          <span className="um-stiel" aria-hidden="true" />
        </div>

        <ol className="um-karten" aria-label="Die fünf Stufen der Reihe nach">
          <Karte teil={START} d={1} />
          {ABSCHNITTE.map((a, k) => (
            <Karte key={a.id} teil={a.teil} farbe={a.farbe} d={k + 2} />
          ))}
        </ol>
        </div>

        <div className="um-ende" data-rv="">
          <Cta href="#termin">{cta.main}</Cta>
        </div>
      </div>
    </section>
  );
}
