/*
 * Versand des Formulars „KI-Workshop sichern“ (portiert von der alten Seite).
 *
 * Jede Anfrage geht an lukas.sehorz@svhconsult.de (content.ts), beim Hoster
 * über ANFRAGE_EMPFAENGER übersteuerbar. Verschickt wird über Resend; der
 * Schlüssel existiert NUR als Umgebungsvariable RESEND_API_KEY.
 *
 * Fehlt der Schlüssel, antwortet der Handler mit 503 und dem Grund
 * „kein-versand“. Das Formular öffnet dann das E-Mail-Programm des Besuchers
 * mit der fertigen Nachricht. So steht nie eine Erfolgsmeldung ohne Versand.
 *
 * Spam-Abwehr (Reihenfolge): nur application/json, nur von der eigenen Seite
 * (Origin/Referer), Größe vor und beim Lesen begrenzt, Prüfung der Angaben (400),
 * dann Falle (unsichtbares Feld) und Zeitfalle (unter 3 s abgeschickt), zuletzt
 * eine einfache Bremse je IP. Treffer der
 * Fallen werden protokolliert, damit verschluckte Anfragen auffallen.
 */

import { NextResponse } from "next/server";
import { company } from "../../content";
import { betreff, htmlFassung, lesen, pruefen, textFassung } from "./format";

/* Absender wie auf der alten Seite. Resend nimmt ihn erst an, wenn die Domain
   svhconsult.de dort bestätigt ist; über ANFRAGE_ABSENDER übersteuerbar. */
const ABSENDER_VORGABE = "SvH Consulting <resend@svhconsult.de>";
const MAX_BYTES = 24_000;
const MIN_DAUER_MS = 3_000;
// Bremse: höchstens 5 Anfragen je IP in 10 Minuten (je Server-Instanz; für mehr Schutz Rate-Limit beim Hoster)
const FENSTER_MS = 10 * 60_000;
const MAX_JE_FENSTER = 5;
const verlauf = new Map<string, number[]>();

function antwort(status: number, daten: Record<string, unknown>) {
  return NextResponse.json(daten, { status, headers: { "Cache-Control": "no-store" } });
}

/** Stammt die Anfrage von dieser Seite? Origin (bzw. Referer) muss zum eigenen Host passen. */
function eigeneHerkunft(request: Request): boolean {
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(",")[0].trim().toLowerCase();
  const erlaubt = new Set([host, new URL(company.url).host, `www.${new URL(company.url).host}`].filter(Boolean));
  const quelle = request.headers.get("origin") || request.headers.get("referer");
  if (!quelle) return false;
  try {
    return erlaubt.has(new URL(quelle).host.toLowerCase());
  } catch {
    return false;
  }
}

function ipVon(request: Request): string {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unbekannt";
}

/** true, wenn diese IP gerade zu viele Anfragen geschickt hat. */
function gebremst(ip: string, jetzt = Date.now()): boolean {
  const liste = (verlauf.get(ip) ?? []).filter((t) => jetzt - t < FENSTER_MS);
  const zuViel = liste.length >= MAX_JE_FENSTER;
  if (!zuViel) liste.push(jetzt);
  verlauf.set(ip, liste);
  if (verlauf.size > 5_000) {
    // alte Einträge aufräumen, damit der Speicher nicht wächst
    for (const [k, v] of verlauf) if (!v.some((t) => jetzt - t < FENSTER_MS)) verlauf.delete(k);
  }
  return zuViel;
}

/** Liest den Körper mit Obergrenze in Bytes (bricht ab, statt 5 MB einzulesen). */
async function leseBegrenzt(request: Request): Promise<string | null> {
  const laenge = Number(request.headers.get("content-length") || 0);
  if (laenge > MAX_BYTES) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const teile: Uint8Array[] = [];
  let summe = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    summe += value.byteLength;
    if (summe > MAX_BYTES) {
      await reader.cancel().catch(() => {});
      return null;
    }
    teile.push(value);
  }
  const alles = new Uint8Array(summe);
  let pos = 0;
  for (const t of teile) {
    alles.set(t, pos);
    pos += t.byteLength;
  }
  return new TextDecoder().decode(alles);
}

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
    return antwort(415, { ok: false, grund: "eingabe" });
  }
  if (!eigeneHerkunft(request)) {
    return antwort(403, { ok: false, grund: "herkunft" });
  }

  let roh: string | null;
  try {
    roh = await leseBegrenzt(request);
  } catch {
    return antwort(400, { ok: false, grund: "eingabe" });
  }
  if (roh === null) {
    return antwort(413, { ok: false, grund: "eingabe" });
  }

  let eingabe: ReturnType<typeof lesen>;
  try {
    eingabe = lesen(JSON.parse(roh));
  } catch {
    return antwort(400, { ok: false, grund: "eingabe" });
  }

  const felder = pruefen(eingabe);
  if (felder.length) {
    return antwort(400, { ok: false, grund: "eingabe", felder });
  }

  /* Fallen: Füllt ein Programm das unsichtbare Feld oder schickt es in unter 3 s ab,
     tun wir so, als wäre alles gut, und verschicken nichts. Protokolliert wird es trotzdem. */
  if (eingabe.nf_extra || eingabe.dauer < MIN_DAUER_MS) {
    console.warn("Anfrage verworfen (Falle)", { grund: eingabe.nf_extra ? "feld" : "zeit", dauer: eingabe.dauer });
    return antwort(200, { ok: true });
  }

  // Bremse zählt nur vollständige Anfragen (Tippfehler verbrauchen nichts)
  if (gebremst(ipVon(request))) {
    return antwort(429, { ok: false, grund: "zu-viele" });
  }

  const schluessel = process.env.RESEND_API_KEY;
  if (!schluessel) {
    return antwort(503, { ok: false, grund: "kein-versand" });
  }

  const empfaenger = process.env.ANFRAGE_EMPFAENGER || company.email;
  const absender = process.env.ANFRAGE_ABSENDER || ABSENDER_VORGABE;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${schluessel}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: absender,
        to: [empfaenger],
        reply_to: eingabe.email,
        subject: betreff(eingabe),
        text: textFassung(eingabe),
        html: htmlFassung(eingabe),
      }),
    });

    if (!res.ok) {
      console.error("Resend hat den Versand abgelehnt", res.status, await res.text());
      return antwort(502, { ok: false, grund: "versand" });
    }

    // Kennung der Mail bei Resend (verrät nichts über den Inhalt, hilft beim Nachsehen der Zustellung)
    const daten = (await res.json().catch(() => null)) as { id?: string } | null;
    return antwort(200, { ok: true, id: daten?.id ?? null });
  } catch (fehler) {
    console.error("Versand fehlgeschlagen", fehler);
    return antwort(502, { ok: false, grund: "versand" });
  }
}
