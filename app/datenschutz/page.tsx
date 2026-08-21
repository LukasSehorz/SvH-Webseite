import type { Metadata } from "next";
import { company } from "../content";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: `Datenschutzerklärung – ${company.name}`,
  description:
    "Informationen zur Verarbeitung personenbezogener Daten auf dieser Website nach der Datenschutz-Grundverordnung (DSGVO).",
};

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der
        Datenschutz-Grundverordnung (DSGVO) ist:
      </p>
      <p>
        <strong>{company.name}</strong>
        <br />
        {company.legalName}
        <br />
        {company.street}
        <br />
        {company.zipCity}
        <br />
        {company.country}
        <br />
        Telefon: <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${company.email}`}>{company.email}</a>
      </p>

      <h2>2. Allgemeines zur Datenverarbeitung</h2>
      <p>
        Wir verarbeiten personenbezogene Daten unserer Nutzerinnen und Nutzer grundsätzlich nur, soweit
        dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen
        erforderlich ist. Die Verarbeitung erfolgt regelmäßig nur nach Einwilligung (Art. 6 Abs. 1
        lit. a DSGVO), zur Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen (Art. 6 Abs. 1
        lit. b DSGVO), zur Erfüllung einer rechtlichen Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO) oder
        auf Grundlage berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Personenbezogene Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung
        entfällt. Eine darüber hinausgehende Speicherung kann erfolgen, wenn dies durch europäische
        oder nationale Vorschriften vorgesehen ist, denen wir unterliegen.
      </p>

      <h2>3. Hosting</h2>
      <p>
        Diese Website wird bei einem externen Dienstleister gehostet. Die auf dieser Website erfassten
        personenbezogenen Daten werden auf den Servern des Hosters gespeichert. Der Einsatz erfolgt zum
        Zweck einer sicheren, schnellen und zuverlässigen Bereitstellung unseres Online-Angebots
        (Art. 6 Abs. 1 lit. f DSGVO). Mit dem Hoster besteht ein Vertrag über die Auftragsverarbeitung
        nach Art. 28 DSGVO.
      </p>

      <h2>4. Server-Logfiles</h2>
      <p>
        Beim Aufruf dieser Website werden automatisch Informationen in sogenannten Server-Logfiles
        erfasst, die Ihr Browser übermittelt. Dies sind insbesondere:
      </p>
      <ul>
        <li>Browsertyp und Browserversion</li>
        <li>verwendetes Betriebssystem</li>
        <li>Referrer-URL</li>
        <li>Hostname des zugreifenden Rechners</li>
        <li>Uhrzeit der Serveranfrage</li>
        <li>IP-Adresse (in der Regel gekürzt bzw. nur kurzzeitig gespeichert)</li>
      </ul>
      <p>
        Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die
        Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse
        liegt in der technisch fehlerfreien Darstellung und der Sicherheit unserer Website.
      </p>

      <h2>5. Kontaktaufnahme</h2>
      <p>
        Wenn Sie uns per E-Mail, Telefon oder über ein Formular kontaktieren, werden Ihre Angaben
        einschließlich der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für
        den Fall von Anschlussfragen bei uns gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
        DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung
        vorvertraglicher Maßnahmen erforderlich ist, im Übrigen Art. 6 Abs. 1 lit. f DSGVO.
      </p>
      <p>
        Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Sie verbleiben bei uns, bis Sie uns
        zur Löschung auffordern, Ihre Einwilligung widerrufen oder der Zweck der Speicherung entfällt.
        Zwingende gesetzliche Aufbewahrungsfristen bleiben unberührt.
      </p>

      <h2>6. Newsletter</h2>
      <p>
        Wenn Sie unseren Newsletter abonnieren möchten, benötigen wir Ihre E-Mail-Adresse. Die
        Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können
        Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, etwa über den
        Abmeldelink in jeder Newsletter-E-Mail oder per Nachricht an uns.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Unsere Website verwendet Cookies, soweit sie für den Betrieb technisch erforderlich sind.
        Rechtsgrundlage hierfür ist § 25 Abs. 2 TDDDG in Verbindung mit Art. 6 Abs. 1 lit. f DSGVO.
        Nicht notwendige Cookies – etwa für Statistik oder Marketing – setzen wir nur mit Ihrer
        vorherigen Einwilligung ein, die Sie jederzeit für die Zukunft widerrufen können. Sie können
        Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies
        nur im Einzelfall erlauben oder generell ausschließen.
      </p>

      <h2>8. Empfänger und Auftragsverarbeiter</h2>
      <p>
        Personenbezogene Daten geben wir nur weiter, wenn dies zur Vertragserfüllung erforderlich ist,
        eine gesetzliche Verpflichtung besteht oder Sie eingewilligt haben. Setzen wir Dienstleister
        ein, die in unserem Auftrag Daten verarbeiten, schließen wir mit diesen Verträge zur
        Auftragsverarbeitung nach Art. 28 DSGVO.
      </p>

      <h2>9. Rechte der betroffenen Personen</h2>
      <p>Ihnen stehen gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten zu:</p>
      <ul>
        <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
        <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
        <li>Recht auf Löschung (Art. 17 DSGVO)</li>
        <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
      </ul>
      <p>
        Haben Sie in die Verarbeitung eingewilligt, können Sie diese Einwilligung jederzeit mit Wirkung
        für die Zukunft widerrufen. Zur Ausübung Ihrer Rechte genügt eine formlose Nachricht an{" "}
        <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>

      <h2>10. Beschwerderecht bei der Aufsichtsbehörde</h2>
      <p>
        Unbeschadet anderweitiger Rechtsbehelfe steht Ihnen nach Art. 77 DSGVO ein Beschwerderecht bei
        einer Datenschutz-Aufsichtsbehörde zu, insbesondere in dem Mitgliedstaat Ihres gewöhnlichen
        Aufenthalts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.
      </p>

      <h2>11. Datensicherheit</h2>
      <p>
        Wir setzen im Rahmen des Website-Besuchs eine Transportverschlüsselung (TLS) ein und treffen
        geeignete technische und organisatorische Maßnahmen, um Ihre Daten gegen zufällige oder
        vorsätzliche Manipulation, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu
        schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung
        fortlaufend angepasst.
      </p>

      <h2>12. Änderungen dieser Datenschutzerklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
        rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen. Für
        Ihren erneuten Besuch gilt dann die jeweils aktuelle Fassung.
      </p>
    </LegalPage>
  );
}
