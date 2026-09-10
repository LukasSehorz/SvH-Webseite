/*
 * Die Anfrage als E-Mail, einmal als HTML und einmal als reiner Text.
 *
 * Beide Fassungen entstehen aus derselben Eingabe und denselben
 * Beschriftungen aus copy.ts. Die Textfassung braucht das Formular auch
 * im Browser, wenn ohne Schluessel beim Hoster das E-Mail-Programm des
 * Besuchers geoeffnet wird; deshalb liegt sie hier und nicht im Route
 * Handler. Die HTML-Fassung ist fuer die Mail ueber Resend gedacht und
 * hat nur Stile, die auch in Outlook und Gmail halten, also Tabellen und
 * Inline-Angaben.
 */

import { contactPage } from "../../copy";

const { mail } = contactPage;

export type Anfrage = {
  name: string;
  company: string;
  industry: string;
  employees: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
};

/** Die Felder in der Reihenfolge, in der sie in der Mail stehen. */
const REIHE: ReadonlyArray<keyof Omit<Anfrage, "message">> = [
  "name",
  "company",
  "industry",
  "employees",
  "email",
  "phone",
  "topic",
];

function wert(anfrage: Anfrage, feld: keyof Anfrage): string {
  return anfrage[feld] || mail.none;
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function betreff(anfrage: Anfrage): string {
  return `${mail.subject} ${anfrage.name}`;
}

/** Reiner Text. Jede Angabe steht unter ihrer Beschriftung, damit sie in
 *  jedem Programm gleich liest, auch ohne feste Schriftbreite. */
export function textFassung(anfrage: Anfrage): string {
  const zeilen: string[] = [mail.title, ""];
  for (const feld of REIHE) {
    zeilen.push(mail.labels[feld].toUpperCase(), wert(anfrage, feld), "");
  }
  zeilen.push(mail.labels.message.toUpperCase(), anfrage.message);
  return zeilen.join("\n");
}

/* Die Farben der Webseite, hier als feste Werte statt als Variablen.
   E-Mail-Programme kennen weder CSS-Variablen noch eine Datei mit
   Stilen, deshalb steht jede Farbe unmittelbar an ihrem Element. Die
   Werte stammen aus globals.css und sind dort --bg, --bg-raise, --ink,
   --acc-violet und --acc-lav. Die halbdurchsichtigen Toene der Webseite
   sind hier ausgerechnet, denn Durchsichtigkeit halten die Programme
   nicht zuverlaessig. */
const BG = "#050507";
const KARTE = "#0b0b10";
const INK = "#f4f4f6";
const INK_2 = "#9b9ba4";
const INK_3 = "#7a7a85";
const LINIE = "#23232b";
const VIOLETT = "#7c6aff";
/* Die Verweise auf Adresse und Telefon sind das Wichtigste zum
   Anklicken, deshalb stehen sie heller als der Lavendelton der Webseite.
   Auf dem dunklen Grund der Mail wuerde b9a5ff hinter dem weiszen Text
   daneben zuruecktreten. */
const LINK = "#cdbcff";

export function htmlFassung(anfrage: Anfrage): string {
  const reihen = REIHE.map((feld, i) => {
    const rand = i < REIHE.length - 1 ? `border-bottom:1px solid ${LINIE};` : "";
    const roh = wert(anfrage, feld);
    const inhalt =
      feld === "email" && anfrage.email
        ? `<a href="mailto:${escape(anfrage.email)}" style="color:${LINK};text-decoration:none">${escape(roh)}</a>`
        : feld === "phone" && anfrage.phone
          ? `<a href="tel:${escape(anfrage.phone.replace(/\s+/g, ""))}" style="color:${LINK};text-decoration:none">${escape(roh)}</a>`
          : escape(roh);
    const ton = anfrage[feld] ? INK : INK_3;
    return `<tr>
  <td class="svh-label" style="padding:13px 0;${rand}color:${INK_3};font-size:14px;width:160px;vertical-align:top">${escape(mail.labels[feld])}</td>
  <td class="svh-wert" style="padding:13px 0;${rand}color:${ton};font-size:15px;font-weight:500;vertical-align:top">${inhalt}</td>
</tr>`;
  }).join("\n");

  /* Der Farbverlauf der Marke als schmaler Streifen ueber der Karte.
     Outlook zeigt keinen Verlauf, deshalb liegt Violett als einfarbige
     Grundlage darunter und der Streifen faellt dort schlicht aus. */
  const streifen = `background:${VIOLETT};background-image:linear-gradient(92deg,#5b8cff 0%,#7c6aff 48%,#b9a5ff 100%)`;

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Die beiden Angaben sagen dem E-Mail-Programm, dass diese Nachricht
     schon dunkel ist. Ohne sie faerben Apple Mail und Outlook dunkle
     Mails im hellen Modus eigenmaechtig um, und dann steht heller Text
     auf hellem Grund. -->
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  /* Gmail dreht im dunklen Modus einzelne Farben. Die Klasse haelt die
     Karte dunkel, wo das Programm sie sonst aufhellen wuerde. */
  :root { color-scheme: dark; supported-color-schemes: dark; }
  @media (max-width: 620px) {
    .svh-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .svh-label { display: block !important; width: auto !important; padding-bottom: 2px !important; }
    .svh-wert { display: block !important; width: auto !important; padding-top: 0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:32px 16px;background:${BG};font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG}"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:${KARTE};border:1px solid ${LINIE};border-radius:16px">
  <tr>
    <td style="${streifen};height:3px;line-height:3px;font-size:0;border-radius:16px 16px 0 0">&nbsp;</td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:26px 32px 22px;border-bottom:1px solid ${LINIE}">
      <span style="display:inline-block;width:9px;height:9px;border-radius:9px;background:${VIOLETT};vertical-align:middle;margin-right:10px"></span>
      <span style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${INK_2};vertical-align:middle">${escape(mail.brand)}</span>
      <div style="font-size:22px;font-weight:600;letter-spacing:-.01em;margin-top:12px;color:${INK}">${escape(mail.title)}</div>
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:6px 32px 0">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="line-height:1.5">
${reihen}
      </table>
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:26px 32px 8px">
      <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${INK_3}">${escape(mail.labels.message)}</div>
      <div style="margin-top:10px;padding:18px 20px;background:${BG};border:1px solid ${LINIE};border-radius:12px;font-size:15px;line-height:1.65;color:${INK};white-space:pre-wrap">${escape(anfrage.message)}</div>
    </td>
  </tr>
  <tr>
    <td class="svh-pad" style="padding:20px 32px 28px;font-size:13px;line-height:1.5;color:${INK_3}">${escape(mail.replyNote)} <span style="color:${INK_2}">${escape(anfrage.email)}</span>.</td>
  </tr>
</table>
</td></tr></table>
</body>
</html>`;
}
