import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/app/content";
import LegalPage, { type LegalSection } from "@/components/pages/LegalPage";
import { pageMeta } from "@/components/pages/meta";

/*
 * Allgemeine Geschäftsbedingungen. Inhalt unverändert von der alten Seite
 * übernommen (SvH-Webseite/app/agb/page.tsx), nur das Layout ist neu.
 * Hinweis: Die Texte nennen noch Marketing- und Webleistungen sowie
 * Werbebudgets und Standortmieten für Displays. Das ist bewusst nicht
 * umgeschrieben (Entscheidung beim Auftraggeber).
 */

export const metadata: Metadata = pageMeta({
  title: "Allgemeine Geschäftsbedingungen",
  description: `Allgemeine Geschäftsbedingungen von ${company.name} für Beratungs-, Automatisierungs-, Marketing- und Webleistungen.`,
  path: "/agb",
});

const sections: LegalSection[] = [
  {
    id: "geltungsbereich",
    num: "§ 1",
    title: "Geltungsbereich",
    body: (
      <>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen {company.legalName}, handelnd unter {company.name}, {company.street || company.streetPending}, {company.zipCity}{" "}
          (nachfolgend „Auftragnehmer“) und ihren Kundinnen und Kunden (nachfolgend „Auftraggeber“) über Beratungs-, Automatisierungs-, Marketing- und Webleistungen.
        </p>
        <p>
          Abweichende, entgegenstehende oder ergänzende Bedingungen des Auftraggebers werden nur dann Vertragsbestandteil, wenn der Auftragnehmer ihrer Geltung ausdrücklich in
          Textform zugestimmt hat. Die Leistungen richten sich ausschließlich an Unternehmer im Sinne des § 14 BGB.
        </p>
      </>
    ),
  },
  {
    id: "vertragsschluss",
    num: "§ 2",
    title: "Vertragsschluss",
    body: (
      <p>
        Angebote des Auftragnehmers sind freibleibend, sofern sie nicht ausdrücklich als verbindlich bezeichnet sind. Ein Vertrag kommt durch die Annahme eines Angebots in Textform (z.
        B. per E-Mail) oder durch Aufnahme der Leistungserbringung zustande. Nebenabreden bedürfen zu ihrer Wirksamkeit der Textform.
      </p>
    ),
  },
  {
    id: "leistungsumfang",
    num: "§ 3",
    title: "Leistungsumfang",
    body: (
      <>
        <p>
          Der Umfang der Leistungen ergibt sich aus dem jeweiligen Angebot beziehungsweise der Leistungsbeschreibung. Der Auftragnehmer schuldet die vereinbarte Tätigkeit, nicht
          jedoch einen bestimmten wirtschaftlichen Erfolg, sofern nicht ausdrücklich ein Werkerfolg vereinbart wurde.
        </p>
        <p>
          Der Auftragnehmer ist berechtigt, zur Erbringung der Leistungen geeignete Dritte (Subunternehmer) einzusetzen. Änderungen des Leistungsumfangs bedürfen einer Vereinbarung
          in Textform; sie können zu einer Anpassung von Vergütung und Terminen führen.
        </p>
      </>
    ),
  },
  {
    id: "mitwirkung",
    num: "§ 4",
    title: "Mitwirkungspflichten des Auftraggebers",
    body: (
      <>
        <p>
          Der Auftraggeber stellt alle für die Leistungserbringung erforderlichen Informationen, Inhalte, Zugänge und Ansprechpartner rechtzeitig, vollständig und unentgeltlich zur
          Verfügung. Dazu gehören insbesondere Zugänge zu Systemen, Konten und Werkzeugen sowie die Benennung einer entscheidungsbefugten Person.
        </p>
        <p>
          Der Auftraggeber steht dafür ein, dass die von ihm bereitgestellten Inhalte frei von Rechten Dritter sind. Verzögerungen, die auf unterbliebene oder verspätete Mitwirkung
          zurückgehen, gehen nicht zu Lasten des Auftragnehmers; vereinbarte Termine verschieben sich entsprechend.
        </p>
      </>
    ),
  },
  {
    id: "verguetung",
    num: "§ 5",
    title: "Vergütung und Zahlung",
    body: (
      <>
        <p>
          Die Vergütung richtet sich nach dem jeweiligen Angebot. Alle Preise verstehen sich zuzüglich der jeweils gültigen gesetzlichen Umsatzsteuer. Wiederkehrende Leistungen
          werden monatlich im Voraus abgerechnet, Projektleistungen nach Vereinbarung, üblicherweise anteilig bei Auftragserteilung und nach Abnahme.
        </p>
        <p>
          Rechnungen sind ohne Abzug innerhalb von 14 Tagen ab Zugang zur Zahlung fällig. Kosten für Leistungen Dritter (z. B. Softwarelizenzen, Werbebudgets, Standortmieten für
          Displays) trägt der Auftraggeber, sofern nicht ausdrücklich etwas anderes vereinbart ist.
        </p>
      </>
    ),
  },
  {
    id: "laufzeit",
    num: "§ 6",
    title: "Laufzeit und Kündigung",
    body: (
      <>
        <p>
          Verträge über laufende Leistungen werden, sofern nichts anderes vereinbart ist, auf unbestimmte Zeit geschlossen und können von beiden Seiten mit einer Frist von einem
          Monat zum Monatsende in Textform gekündigt werden. Bei vereinbarter Mindestlaufzeit ist eine ordentliche Kündigung erstmals zum Ende der Mindestlaufzeit möglich.
        </p>
        <p>Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>
      </>
    ),
  },
  {
    id: "nutzungsrechte",
    num: "§ 7",
    title: "Nutzungsrechte",
    body: (
      <>
        <p>
          Der Auftraggeber erhält an den vertraglich erstellten Arbeitsergebnissen mit vollständiger Bezahlung der vereinbarten Vergütung ein einfaches, zeitlich und räumlich
          unbeschränktes Nutzungsrecht für den vertraglich vorausgesetzten Zweck.
        </p>
        <p>
          Vorbestehende Werkzeuge, Vorlagen, Bibliotheken und Konzepte des Auftragnehmers verbleiben in dessen Eigentum; der Auftraggeber erhält daran ein einfaches Nutzungsrecht,
          soweit dies für die Nutzung der Arbeitsergebnisse erforderlich ist. Rechte an Leistungen Dritter richten sich nach deren jeweiligen Lizenzbedingungen.
        </p>
      </>
    ),
  },
  {
    id: "gewaehrleistung",
    num: "§ 8",
    title: "Gewährleistung",
    body: (
      <>
        <p>
          Für Werkleistungen gelten die gesetzlichen Gewährleistungsvorschriften mit der Maßgabe, dass der Auftragnehmer zunächst zur Nacherfüllung berechtigt ist. Mängel sind
          unverzüglich nach Entdeckung in Textform und nachvollziehbar zu rügen.
        </p>
        <p>
          Keine Mängel sind Beeinträchtigungen, die auf Änderungen durch den Auftraggeber oder Dritte, auf unsachgemäße Nutzung oder auf Änderungen von Schnittstellen und Diensten
          Dritter zurückzuführen sind.
        </p>
      </>
    ),
  },
  {
    id: "haftung",
    num: "§ 9",
    title: "Haftung",
    body: (
      <>
        <p>
          Der Auftragnehmer haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei arglistigem Verschweigen eines Mangels, bei Verletzung von Leben, Körper oder Gesundheit
          sowie nach dem Produkthaftungsgesetz.
        </p>
        <p>
          Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen
          ist die Haftung ausgeschlossen. Für den Verlust von Daten haftet der Auftragnehmer nur in dem Umfang, der bei ordnungsgemäßer und regelmäßiger Datensicherung durch den
          Auftraggeber entstanden wäre.
        </p>
      </>
    ),
  },
  {
    id: "vertraulichkeit",
    num: "§ 10",
    title: "Vertraulichkeit und Datenschutz",
    body: (
      <>
        <p>
          Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit bekannt gewordenen vertraulichen Informationen der jeweils anderen Partei geheim zu halten und nur für
          Zwecke der Vertragserfüllung zu verwenden. Diese Pflicht besteht auch nach Beendigung des Vertrags fort.
        </p>
        <p>
          Verarbeitet der Auftragnehmer im Auftrag des Auftraggebers personenbezogene Daten, schließen die Parteien einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.
          Einzelheiten zur Verarbeitung auf dieser Website finden Sie in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
      </>
    ),
  },
  {
    id: "referenz",
    num: "§ 11",
    title: "Referenznennung",
    body: (
      <p>
        Der Auftragnehmer darf den Auftraggeber nur nach dessen vorheriger Zustimmung in Textform als Referenz benennen und dabei Name und Logo verwenden. Die Zustimmung kann
        jederzeit für die Zukunft widerrufen werden.
      </p>
    ),
  },
  {
    id: "schluss",
    num: "§ 12",
    title: "Schlussbestimmungen",
    body: (
      <>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Erfüllungsort ist der Sitz des Auftragnehmers. Ist der Auftraggeber Unternehmer,
          juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, so ist der Sitz des Auftragnehmers zugleich ausschließlicher Gerichtsstand.
        </p>
        <p>
          Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der
          unwirksamen Bestimmung tritt die gesetzliche Regelung.
        </p>
      </>
    ),
  },
];

export default function AgbPage() {
  // Weiches Trennzeichen, damit das lange Wort auf schmalen Telefonen sauber umbricht
  return <LegalPage title={"Allgemeine Geschäfts­bedingungen"} sections={sections} />;
}
