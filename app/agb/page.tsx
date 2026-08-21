import type { Metadata } from "next";
import { company } from "../content";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: `AGB – ${company.name}`,
  description: `Allgemeine Geschäftsbedingungen von ${company.name} für Beratungs-, Automatisierungs-, Marketing- und Webleistungen.`,
};

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen{" "}
        {company.legalName}, handelnd unter {company.name}, {company.street}, {company.zipCity}{" "}
        (nachfolgend „Auftragnehmer“) und ihren Kundinnen und Kunden (nachfolgend „Auftraggeber“) über
        Beratungs-, Automatisierungs-, Marketing- und Webleistungen.
      </p>
      <p>
        Abweichende, entgegenstehende oder ergänzende Bedingungen des Auftraggebers werden nur dann
        Vertragsbestandteil, wenn der Auftragnehmer ihrer Geltung ausdrücklich in Textform zugestimmt
        hat. Die Leistungen richten sich ausschließlich an Unternehmer im Sinne des § 14 BGB.
      </p>

      <h2>§ 2 Vertragsschluss</h2>
      <p>
        Angebote des Auftragnehmers sind freibleibend, sofern sie nicht ausdrücklich als verbindlich
        bezeichnet sind. Ein Vertrag kommt durch die Annahme eines Angebots in Textform (z. B. per
        E-Mail) oder durch Aufnahme der Leistungserbringung zustande. Nebenabreden bedürfen zu ihrer
        Wirksamkeit der Textform.
      </p>

      <h2>§ 3 Leistungsumfang</h2>
      <p>
        Der Umfang der Leistungen ergibt sich aus dem jeweiligen Angebot beziehungsweise der
        Leistungsbeschreibung. Der Auftragnehmer schuldet die vereinbarte Tätigkeit, nicht jedoch einen
        bestimmten wirtschaftlichen Erfolg, sofern nicht ausdrücklich ein Werkerfolg vereinbart wurde.
      </p>
      <p>
        Der Auftragnehmer ist berechtigt, zur Erbringung der Leistungen geeignete Dritte
        (Subunternehmer) einzusetzen. Änderungen des Leistungsumfangs bedürfen einer Vereinbarung in
        Textform; sie können zu einer Anpassung von Vergütung und Terminen führen.
      </p>

      <h2>§ 4 Mitwirkungspflichten des Auftraggebers</h2>
      <p>
        Der Auftraggeber stellt alle für die Leistungserbringung erforderlichen Informationen, Inhalte,
        Zugänge und Ansprechpartner rechtzeitig, vollständig und unentgeltlich zur Verfügung. Dazu
        gehören insbesondere Zugänge zu Systemen, Konten und Werkzeugen sowie die Benennung einer
        entscheidungsbefugten Person.
      </p>
      <p>
        Der Auftraggeber steht dafür ein, dass die von ihm bereitgestellten Inhalte frei von Rechten
        Dritter sind. Verzögerungen, die auf unterbliebene oder verspätete Mitwirkung zurückgehen, gehen
        nicht zu Lasten des Auftragnehmers; vereinbarte Termine verschieben sich entsprechend.
      </p>

      <h2>§ 5 Vergütung und Zahlung</h2>
      <p>
        Die Vergütung richtet sich nach dem jeweiligen Angebot. Alle Preise verstehen sich zuzüglich
        der jeweils gültigen gesetzlichen Umsatzsteuer. Wiederkehrende Leistungen werden monatlich im
        Voraus abgerechnet, Projektleistungen nach Vereinbarung, üblicherweise anteilig bei
        Auftragserteilung und nach Abnahme.
      </p>
      <p>
        Rechnungen sind ohne Abzug innerhalb von 14 Tagen ab Zugang zur Zahlung fällig. Kosten für
        Leistungen Dritter (z. B. Softwarelizenzen, Werbebudgets, Standortmieten für Displays) trägt
        der Auftraggeber, sofern nicht ausdrücklich etwas anderes vereinbart ist.
      </p>

      <h2>§ 6 Laufzeit und Kündigung</h2>
      <p>
        Verträge über laufende Leistungen werden, sofern nichts anderes vereinbart ist, auf unbestimmte
        Zeit geschlossen und können von beiden Seiten mit einer Frist von einem Monat zum Monatsende in
        Textform gekündigt werden. Bei vereinbarter Mindestlaufzeit ist eine ordentliche Kündigung
        erstmals zum Ende der Mindestlaufzeit möglich.
      </p>
      <p>Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>

      <h2>§ 7 Nutzungsrechte</h2>
      <p>
        Der Auftraggeber erhält an den vertraglich erstellten Arbeitsergebnissen mit vollständiger
        Bezahlung der vereinbarten Vergütung ein einfaches, zeitlich und räumlich unbeschränktes
        Nutzungsrecht für den vertraglich vorausgesetzten Zweck.
      </p>
      <p>
        Vorbestehende Werkzeuge, Vorlagen, Bibliotheken und Konzepte des Auftragnehmers verbleiben in
        dessen Eigentum; der Auftraggeber erhält daran ein einfaches Nutzungsrecht, soweit dies für die
        Nutzung der Arbeitsergebnisse erforderlich ist. Rechte an Leistungen Dritter richten sich nach
        deren jeweiligen Lizenzbedingungen.
      </p>

      <h2>§ 8 Gewährleistung</h2>
      <p>
        Für Werkleistungen gelten die gesetzlichen Gewährleistungsvorschriften mit der Maßgabe, dass
        der Auftragnehmer zunächst zur Nacherfüllung berechtigt ist. Mängel sind unverzüglich nach
        Entdeckung in Textform und nachvollziehbar zu rügen.
      </p>
      <p>
        Keine Mängel sind Beeinträchtigungen, die auf Änderungen durch den Auftraggeber oder Dritte, auf
        unsachgemäße Nutzung oder auf Änderungen von Schnittstellen und Diensten Dritter
        zurückzuführen sind.
      </p>

      <h2>§ 9 Haftung</h2>
      <p>
        Der Auftragnehmer haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei arglistigem
        Verschweigen eines Mangels, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem
        Produkthaftungsgesetz.
      </p>
      <p>
        Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist die
        Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung
        ausgeschlossen. Für den Verlust von Daten haftet der Auftragnehmer nur in dem Umfang, der bei
        ordnungsgemäßer und regelmäßiger Datensicherung durch den Auftraggeber entstanden wäre.
      </p>

      <h2>§ 10 Vertraulichkeit und Datenschutz</h2>
      <p>
        Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit bekannt gewordenen
        vertraulichen Informationen der jeweils anderen Partei geheim zu halten und nur für Zwecke der
        Vertragserfüllung zu verwenden. Diese Pflicht besteht auch nach Beendigung des Vertrags fort.
      </p>
      <p>
        Verarbeitet der Auftragnehmer im Auftrag des Auftraggebers personenbezogene Daten, schließen
        die Parteien einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO. Einzelheiten zur
        Verarbeitung auf dieser Website finden Sie in unserer{" "}
        <a href="/datenschutz">Datenschutzerklärung</a>.
      </p>

      <h2>§ 11 Referenznennung</h2>
      <p>
        Der Auftragnehmer darf den Auftraggeber nur nach dessen vorheriger Zustimmung in Textform als
        Referenz benennen und dabei Name und Logo verwenden. Die Zustimmung kann jederzeit für die
        Zukunft widerrufen werden.
      </p>

      <h2>§ 12 Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
        Erfüllungsort und – soweit der Auftraggeber Unternehmer, juristische Person des öffentlichen
        Rechts oder öffentlich-rechtliches Sondervermögen ist – ausschließlicher Gerichtsstand ist der
        Sitz des Auftragnehmers.
      </p>
      <p>
        Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt
        die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung
        tritt die gesetzliche Regelung.
      </p>
    </LegalPage>
  );
}
