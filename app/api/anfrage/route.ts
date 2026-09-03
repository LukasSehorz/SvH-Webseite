/*
 * Versand des Kontaktformulars.
 *
 * Der Auftraggeber hat am 03.09.2026 festgelegt, dass jede Anfrage aus dem
 * Formular an lukas.sehorz@schconsult.de geht. Die Adresse steht in
 * content.ts und laesst sich beim Hoster ueber ANFRAGE_EMPFAENGER
 * uebersteuern. Verschickt wird ueber Resend, dessen Schluessel NUR als
 * Umgebungsvariable RESEND_API_KEY existiert und nie im Quelltext steht.
 *
 * Fehlt der Schluessel, antwortet der Handler mit 503 und dem Grund
 * kein-versand. Das Formular oeffnet dann das E-Mail-Programm des
 * Besuchers mit der fertigen Nachricht, damit auch ohne Hoster-Einrichtung
 * jede Anfrage ankommt und nie eine Erfolgsmeldung ohne Versand steht.
 */

import { NextResponse } from "next/server";
import { company } from "../../content";
import { betreff, htmlFassung, textFassung, type Anfrage } from "./format";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Resend erlaubt als Absender nur eine geprüfte Domain oder die eigene
   Testadresse. Bis die Domain des Auftraggebers bei Resend eingetragen
   ist, bleibt es bei der Testadresse; sie darf nur an die Adresse des
   Resend-Kontos senden. */
const ABSENDER_VORGABE = "SVH Webseite <onboarding@resend.dev>";

type Eingabe = Anfrage & { website: string };

function lesen(daten: unknown): Eingabe {
  const d = (daten && typeof daten === "object" ? daten : {}) as Record<string, unknown>;
  const text = (k: string, max: number) => String(d[k] ?? "").trim().slice(0, max);
  return {
    name: text("name", 120),
    company: text("company", 160),
    industry: text("industry", 120),
    employees: text("employees", 40),
    email: text("email", 200),
    phone: text("phone", 60),
    topic: text("topic", 80),
    message: text("message", 4000),
    website: text("website", 200),
  };
}

export async function POST(request: Request) {
  let eingabe: Eingabe;
  try {
    eingabe = lesen(await request.json());
  } catch {
    return NextResponse.json({ ok: false, grund: "eingabe" }, { status: 400 });
  }

  /* Das Feld website ist fuer Menschen unsichtbar. Fuellt ein Programm es
     aus, tun wir so, als waere alles gut, und verschicken nichts. */
  if (eingabe.website) {
    return NextResponse.json({ ok: true });
  }

  if (!eingabe.name || !eingabe.message || !EMAIL.test(eingabe.email)) {
    return NextResponse.json({ ok: false, grund: "eingabe" }, { status: 400 });
  }

  const schluessel = process.env.RESEND_API_KEY;
  if (!schluessel) {
    return NextResponse.json({ ok: false, grund: "kein-versand" }, { status: 503 });
  }

  const empfaenger = process.env.ANFRAGE_EMPFAENGER || company.email;
  const absender = process.env.ANFRAGE_ABSENDER || ABSENDER_VORGABE;

  try {
    const antwort = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${schluessel}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: absender,
        to: [empfaenger],
        reply_to: eingabe.email,
        subject: betreff(eingabe),
        text: textFassung(eingabe),
        html: htmlFassung(eingabe),
      }),
    });

    if (!antwort.ok) {
      console.error("Resend hat den Versand abgelehnt", antwort.status, await antwort.text());
      return NextResponse.json({ ok: false, grund: "versand" }, { status: 502 });
    }
  } catch (fehler) {
    console.error("Versand fehlgeschlagen", fehler);
    return NextResponse.json({ ok: false, grund: "versand" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
