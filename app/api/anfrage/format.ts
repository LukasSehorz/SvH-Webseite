/*
 * Die Anfrage aus dem Formular „KI-Workshop sichern“: Felder, Prüfung und
 * die E-Mail an uns (HTML für Resend, reiner Text für den mailto-Rückweg).
 *
 * Diese Datei wird vom Route Handler UND vom Formular im Browser benutzt.
 * So prüfen beide mit denselben Regeln, und die Nachricht sieht auf beiden
 * Wegen (Resend oder E-Mail-Programm des Besuchers) gleich aus.
 * Portiert von der alten Seite (app/api/anfrage/format.ts), angepasst an
 * die neuen Felder.
 */

import { abschluss } from "../../copy";

const { mail, step1, step2 } = abschluss;

export const ZEITFRESSER: readonly string[] = step1.tiles;
export const GROESSEN: readonly string[] = step2.sizes;
export const STUNDEN = { min: 1, max: 80, start: 10 } as const;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Anfrage = {
  tasks: string[];
  hours: number;
  employees: string;
  industry: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

export type Feld = "tasks" | "hours" | "employees" | "name" | "company" | "email" | "consent";

/** Liest beliebige Eingaben in eine saubere Anfrage (Längen begrenzt, nur bekannte Werte). */
/** Zusätzliche Felder nur für die Spam-Abwehr (nie in der Mail). */
export type Abwehr = {
  /** Falle: für Menschen unsichtbares Feld mit neutralem Namen (kein Autofill) */
  nf_extra: string;
  /** Millisekunden zwischen Öffnen des Formulars und Absenden (Zeitfalle) */
  dauer: number;
};

export function lesen(daten: unknown): Anfrage & Abwehr {
  const d = (daten && typeof daten === "object" ? daten : {}) as Record<string, unknown>;
  // Steuerzeichen raus; einzeilige Felder ohne Zeilenumbrüche (Betreffzeile)
  const text = (k: string, max: number, mehrzeilig = false) => {
    const s = String(d[k] ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    return (mehrzeilig ? s : s.replace(/\s+/g, " ")).trim().slice(0, max);
  };
  const roh = Array.isArray(d.tasks) ? d.tasks : [];
  const tasks = ZEITFRESSER.filter((t) => roh.some((r) => String(r) === t));
  const h = Math.round(Number(d.hours));
  return {
    tasks,
    hours: Number.isFinite(h) ? h : 0,
    employees: GROESSEN.includes(String(d.employees ?? "")) ? String(d.employees) : "",
    industry: text("industry", 120),
    name: text("name", 120),
    company: text("company", 160),
    email: text("email", 200),
    phone: text("phone", 60),
    message: text("message", 4000, true),
    consent: d.consent === true,
    nf_extra: text("nf_extra", 200),
    dauer: Number.isFinite(Number(d.dauer)) ? Math.max(0, Math.round(Number(d.dauer))) : 0,
  };
}

/** Pflichtangaben prüfen; gibt die Felder zurück, die fehlen oder falsch sind. */
export function pruefen(a: Anfrage): Feld[] {
  const fehler: Feld[] = [];
  if (!a.tasks.length) fehler.push("tasks");
  if (!(a.hours >= STUNDEN.min && a.hours <= STUNDEN.max)) fehler.push("hours");
  if (!a.employees) fehler.push("employees");
  if (!a.name) fehler.push("name");
  if (!a.company) fehler.push("company");
  if (!EMAIL.test(a.email)) fehler.push("email");
  if (!a.consent) fehler.push("consent");
  return fehler;
}

const zahl = (n: number) => n.toLocaleString("de-DE");

export function hochrechnung(hours: number) {
  const { year, weeks } = step1.calc(hours);
  return { year, weeks, text: mail.yearValue(zahl(year), zahl(weeks)) };
}

export function betreff(a: Anfrage): string {
  return `${mail.subject} ${a.name}${a.company ? `, ${a.company}` : ""}`;
}

type Reihe = { label: string; wert: string; link?: string };

function reihen(a: Anfrage): Reihe[] {
  const none = mail.none;
  return [
    { label: mail.labels.tasks, wert: a.tasks.join(", ") || none },
    { label: mail.labels.hours, wert: String(a.hours) },
    { label: mail.labels.year, wert: hochrechnung(a.hours).text },
    { label: mail.labels.employees, wert: a.employees || none },
    { label: mail.labels.industry, wert: a.industry || none },
    { label: mail.labels.name, wert: a.name || none },
    { label: mail.labels.company, wert: a.company || none },
    { label: mail.labels.email, wert: a.email || none, link: a.email ? `mailto:${a.email}` : undefined },
    { label: mail.labels.phone, wert: a.phone || none, link: a.phone ? `tel:${a.phone.replace(/[^\d+]/g, "")}` : undefined },
  ];
}

function zeitstempel(d = new Date()): string {
  return d.toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" });
}

/** Reiner Text: jede Angabe unter ihrer Beschriftung, liest sich in jedem Programm gleich. */
export function textFassung(a: Anfrage, maxNachricht = 4000): string {
  const z: string[] = [mail.title, ""];
  for (const r of reihen(a)) z.push(r.label.toUpperCase(), r.wert, "");
  z.push(mail.labels.message.toUpperCase(), (a.message || mail.none).slice(0, maxNachricht));
  if (a.consent) z.push("", `${mail.consentLine} ${zeitstempel()}.`);
  return z.join("\n");
}

/** mailto-Adresse für den Rückweg ohne Resend-Schlüssel (Nachricht gekürzt, damit die Adresse nicht zu lang wird). */
export function mailtoAdresse(a: Anfrage, an: string): string {
  return `mailto:${an}?subject=${encodeURIComponent(betreff(a))}&body=${encodeURIComponent(textFassung(a, 1200))}`;
}

function escape(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Markenfarben als feste Werte: E-Mail-Programme kennen keine CSS-Variablen
   und halten Durchsichtigkeit nicht zuverlässig. */
const BG = "#050507";
const KARTE = "#0b0b10";
const INK = "#f4f4f6";
const INK_2 = "#a7a7b0";
const INK_3 = "#7a7a85";
const LINIE = "#23232b";
const VIOLETT = "#7c6aff";
const LINK = "#cdbcff";

/** HTML-Fassung für Resend: Tabellen und Inline-Stile, damit sie in Outlook und Gmail hält. */
export function htmlFassung(a: Anfrage): string {
  const liste = reihen(a).filter((r) => r.label !== mail.labels.tasks && r.label !== mail.labels.hours && r.label !== mail.labels.year);
  const zeilen = liste
    .map((r, i) => {
      const rand = i < liste.length - 1 ? `border-bottom:1px solid ${LINIE};` : "";
      const leer = r.wert === mail.none;
      const inhalt = r.link ? `<a href="${escape(r.link)}" style="color:${LINK};text-decoration:none">${escape(r.wert)}</a>` : escape(r.wert);
      return `<tr>
  <td class="svh-label" style="padding:13px 0;${rand}color:${INK_3};font-size:14px;width:150px;vertical-align:top">${escape(r.label)}</td>
  <td class="svh-wert" style="padding:13px 0;${rand}color:${leer ? INK_3 : INK};font-size:15px;font-weight:500;vertical-align:top">${inhalt}</td>
</tr>`;
    })
    .join("\n");

  const kapseln = a.tasks
    .map(
      (t) =>
        `<span style="display:inline-block;margin:0 6px 8px 0;padding:6px 12px;border:1px solid #3a3360;border-radius:999px;background:#15122a;color:${INK};font-size:13px;line-height:1.3">${escape(t)}</span>`,
    )
    .join("");

  const { year } = hochrechnung(a.hours);
  const streifen = `background:${VIOLETT};background-image:linear-gradient(92deg,#5b8cff 0%,#7c6aff 48%,#b9a5ff 100%)`;

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  :root { color-scheme: dark; supported-color-schemes: dark; }
  @media (max-width: 620px) {
    .svh-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .svh-label { display: block !important; width: auto !important; padding-bottom: 2px !important; }
    .svh-wert { display: block !important; width: auto !important; padding-top: 0 !important; }
    .svh-kz td { display: block !important; width: auto !important; }
  }
</style>
</head>
<body style="margin:0;padding:32px 16px;background:${BG};font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG}"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${KARTE};border:1px solid ${LINIE};border-radius:16px">
  <tr><td style="${streifen};height:3px;line-height:3px;font-size:0;border-radius:16px 16px 0 0">&nbsp;</td></tr>
  <tr>
    <td class="svh-pad" style="padding:26px 32px 22px;border-bottom:1px solid ${LINIE}">
      <span style="display:inline-block;width:9px;height:9px;border-radius:9px;background:${VIOLETT};vertical-align:middle;margin-right:10px"></span>
      <span style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${INK_2};vertical-align:middle">${escape(mail.brand)}</span>
      <div style="font-size:22px;font-weight:600;letter-spacing:-.01em;margin-top:12px;color:${INK}">${escape(mail.title)}</div>
      <div style="font-size:15px;margin-top:6px;color:${INK_2}">${escape(a.name)}${a.company ? ` · ${escape(a.company)}` : ""}</div>
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:24px 32px 6px">
      <table role="presentation" class="svh-kz" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};border:1px solid ${LINIE};border-radius:12px">
        <tr>
          <td style="padding:18px 20px;width:50%;vertical-align:top">
            <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${INK_3}">${escape(mail.labels.hours)}</div>
            <div style="font-size:30px;font-weight:600;letter-spacing:-.02em;margin-top:6px;color:${INK}">${a.hours}</div>
          </td>
          <td style="padding:18px 20px;width:50%;vertical-align:top">
            <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${INK_3}">${escape(mail.labels.year)}</div>
            <div style="font-size:30px;font-weight:600;letter-spacing:-.02em;margin-top:6px;color:${LINK}">${zahl(year)}</div>
          </td>
        </tr>
      </table>
      <div style="font-size:13px;line-height:1.5;margin-top:8px;color:${INK_3}">${escape(hochrechnung(a.hours).text)}</div>
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:22px 32px 4px">
      <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${INK_3};margin-bottom:10px">${escape(mail.labels.tasks)}</div>
      ${kapseln || `<span style="color:${INK_3};font-size:14px">${escape(mail.none)}</span>`}
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:10px 32px 0">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="line-height:1.5">
${zeilen}
      </table>
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:22px 32px 8px">
      <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${INK_3}">${escape(mail.labels.message)}</div>
      <div style="margin-top:10px;padding:18px 20px;background:${BG};border:1px solid ${LINIE};border-radius:12px;font-size:15px;line-height:1.65;color:${a.message ? INK : INK_3};white-space:pre-wrap">${escape(a.message || mail.none)}</div>
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:20px 32px 28px;font-size:13px;line-height:1.6;color:${INK_3}">${escape(mail.replyNote)} <span style="color:${INK_2}">${escape(a.email)}</span>.<br>${escape(mail.consentLine)} ${escape(zeitstempel())}.</td>
  </tr>
</table>
</td></tr></table>
</body>
</html>`;
}
