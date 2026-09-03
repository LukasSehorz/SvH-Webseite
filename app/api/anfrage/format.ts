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

const GRAU = "#6b6b78";
const LINIE = "#ececf1";

export function htmlFassung(anfrage: Anfrage): string {
  const reihen = REIHE.map((feld, i) => {
    const rand = i < REIHE.length - 1 ? `border-bottom:1px solid ${LINIE};` : "";
    const roh = wert(anfrage, feld);
    const inhalt =
      feld === "email" && anfrage.email
        ? `<a href="mailto:${escape(anfrage.email)}" style="color:#4b63d6;text-decoration:none">${escape(roh)}</a>`
        : feld === "phone" && anfrage.phone
          ? `<a href="tel:${escape(anfrage.phone.replace(/\s+/g, ""))}" style="color:#4b63d6;text-decoration:none">${escape(roh)}</a>`
          : escape(roh);
    const ton = anfrage[feld] ? "#16161a" : GRAU;
    return `<tr>
  <td style="padding:13px 0;${rand}color:${GRAU};font-size:14px;width:160px;vertical-align:top">${escape(mail.labels[feld])}</td>
  <td style="padding:13px 0;${rand}color:${ton};font-size:15px;font-weight:500;vertical-align:top">${inhalt}</td>
</tr>`;
  }).join("\n");

  return `<!doctype html>
<html lang="de">
<body style="margin:0;padding:32px 16px;background:#f4f4f6;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#16161a">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e4e4ea;border-radius:16px">
  <tr>
    <td style="padding:26px 32px 22px;border-bottom:1px solid ${LINIE}">
      <span style="display:inline-block;width:9px;height:9px;border-radius:9px;background:#7c6aff;vertical-align:middle;margin-right:10px"></span>
      <span style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${GRAU};vertical-align:middle">${escape(mail.brand)}</span>
      <div style="font-size:22px;font-weight:600;letter-spacing:-.01em;margin-top:12px">${escape(mail.title)}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:6px 32px 0">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="line-height:1.5">
${reihen}
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:26px 32px 8px">
      <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${GRAU}">${escape(mail.labels.message)}</div>
      <div style="margin-top:10px;padding:18px 20px;background:#f7f7fa;border-radius:12px;font-size:15px;line-height:1.65;white-space:pre-wrap">${escape(anfrage.message)}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 32px 28px;font-size:13px;line-height:1.5;color:${GRAU}">${escape(mail.replyNote)} ${escape(anfrage.email)}.</td>
  </tr>
</table>
</td></tr></table>
</body>
</html>`;
}
