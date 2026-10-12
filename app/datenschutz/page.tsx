import type { Metadata } from "next";
import { footer } from "@/app/copy";
import { company } from "@/app/content";
import LegalPage, { type LegalSection } from "@/components/pages/LegalPage";
import { pageMeta } from "@/components/pages/meta";

/*
 * Datenschutzerklärung. Inhalt unverändert von der alten Seite übernommen
 * (SvH-Webseite/app/datenschutz/page.tsx), nur das Layout ist neu.
 * Einzige Anpassung: Abschnitt 8 nennt den Widerruf-Link in der Fußzeile mit
 * seinem heutigen Namen (footer.consent, „Cookie-Einstellungen“ statt früher
 * „Messung ändern“), damit der Verweis nicht ins Leere zeigt.
 */

export const metadata: Metadata = pageMeta({
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten auf dieser Website nach der Datenschutz-Grundverordnung (DSGVO).",
  path: "/datenschutz",
});

const sections: LegalSection[] = [
  {
    id: "verantwortlicher",
    num: "1.",
    title: "Verantwortlicher",
    body: (
      <>
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist die folgende Stelle.</p>
        <p>
          <strong>{company.name}</strong>
          <br />
          {company.legalName}
          <br />
          {company.street || company.streetPending}
          <br />
          {company.zipCity}
          <br />
          {company.country}
        </p>
        <dl className="lg-dl">
          <dt>Telefon</dt>
          <dd>
            <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
          </dd>
          <dt>E-Mail</dt>
          <dd>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </dd>
        </dl>
      </>
    ),
  },
  {
    id: "allgemeines",
    num: "2.",
    title: "Allgemeines zur Datenverarbeitung",
    body: (
      <>
        <p>
          Wir verarbeiten personenbezogene Daten unserer Nutzerinnen und Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer
          Inhalte und Leistungen erforderlich ist. Die Verarbeitung erfolgt regelmäßig nur nach Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), zur Erfüllung eines Vertrags oder
          vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO), zur Erfüllung einer rechtlichen Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO) oder auf Grundlage berechtigter
          Interessen (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
        <p>
          Personenbezogene Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt. Eine darüber hinausgehende Speicherung kann erfolgen, wenn dies durch
          europäische oder nationale Vorschriften vorgesehen ist, denen wir unterliegen.
        </p>
      </>
    ),
  },
  {
    id: "hosting",
    num: "3.",
    title: "Hosting",
    body: (
      <p>
        Diese Website wird bei einem externen Dienstleister gehostet. Die auf dieser Website erfassten personenbezogenen Daten werden auf den Servern des Hosters gespeichert. Der
        Einsatz erfolgt zum Zweck einer sicheren, schnellen und zuverlässigen Bereitstellung unseres Online-Angebots (Art. 6 Abs. 1 lit. f DSGVO). Mit dem Hoster besteht ein Vertrag
        über die Auftragsverarbeitung nach Art. 28 DSGVO.
      </p>
    ),
  },
  {
    id: "logfiles",
    num: "4.",
    title: "Server-Logfiles",
    body: (
      <>
        <p>
          Beim Aufruf dieser Website werden automatisch Informationen in sogenannten Server-Logfiles erfasst, die Ihr Browser übermittelt. Dazu gehören insbesondere die folgenden
          Angaben.
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
          Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes
          Interesse liegt in der technisch fehlerfreien Darstellung und der Sicherheit unserer Website.
        </p>
      </>
    ),
  },
  {
    id: "kontaktaufnahme",
    num: "5.",
    title: "Kontaktaufnahme",
    body: (
      <>
        <p>
          Wenn Sie uns per E-Mail, Telefon oder über ein Formular kontaktieren, werden Ihre Angaben einschließlich der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der
          Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags
          zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist, im Übrigen Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Sie verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung widerrufen oder der Zweck der
          Speicherung entfällt. Zwingende gesetzliche Aufbewahrungsfristen bleiben unberührt.
        </p>
      </>
    ),
  },
  {
    id: "newsletter",
    num: "6.",
    title: "Newsletter",
    body: (
      <p>
        Wenn Sie unseren Newsletter abonnieren möchten, benötigen wir Ihre E-Mail-Adresse. Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie
        können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, etwa über den Abmeldelink in jeder Newsletter-E-Mail oder per Nachricht an uns.
      </p>
    ),
  },
  {
    id: "cookies",
    num: "7.",
    title: "Cookies",
    body: (
      <p>
        Unsere Website verwendet Cookies, soweit sie für den Betrieb technisch erforderlich sind. Rechtsgrundlage hierfür ist § 25 Abs. 2 TDDDG in Verbindung mit Art. 6 Abs. 1 lit.
        f DSGVO. Nicht notwendige Cookies, etwa für Statistik oder Marketing, setzen wir nur mit Ihrer vorherigen Einwilligung ein, die Sie jederzeit für die Zukunft widerrufen
        können. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben oder generell ausschließen.
      </p>
    ),
  },
  {
    id: "tag-manager",
    num: "8.",
    title: "Reichweitenmessung mit dem Google Tag Manager",
    body: (
      <>
        <p>
          Wir möchten wissen, welche Seiten gelesen werden und über welchen Weg Besucher zu uns finden. Dafür setzen wir den Google Tag Manager der Google Ireland Limited, Gordon
          House, Barrow Street, Dublin 4, Irland ein. Über ihn werden Analysewerkzeuge geladen, die Informationen auf Ihrem Gerät speichern und Ihre IP-Adresse an Google übermitteln.
          Eine Übermittlung in die Vereinigten Staaten ist dabei nicht ausgeschlossen; Google ist unter dem EU-US Data Privacy Framework zertifiziert.
        </p>
        <p>
          Der Tag Manager wird erst geladen, nachdem Sie im Hinweisfeld auf „Einverstanden“ geklickt haben. Rechtsgrundlage ist Ihre Einwilligung nach § 25 Abs. 1 TDDDG und Art. 6
          Abs. 1 lit. a DSGVO. Ohne Ihre Einwilligung wird nichts an Google gesendet und nichts auf Ihrem Gerät gespeichert, und die Website funktioniert vollständig.
        </p>
        <p>
          Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Am Ende jeder Seite finden Sie dafür den Punkt „{footer.consent}“. Ihre Entscheidung selbst
          speichern wir im Speicher Ihres Browsers, damit wir Sie nicht bei jedem Aufruf erneut fragen müssen; diese Angabe verlässt Ihr Gerät nicht.
        </p>
      </>
    ),
  },
  {
    id: "empfaenger",
    num: "9.",
    title: "Empfänger und Auftragsverarbeiter",
    body: (
      <p>
        Personenbezogene Daten geben wir nur weiter, wenn dies zur Vertragserfüllung erforderlich ist, eine gesetzliche Verpflichtung besteht oder Sie eingewilligt haben. Setzen wir
        Dienstleister ein, die in unserem Auftrag Daten verarbeiten, schließen wir mit diesen Verträge zur Auftragsverarbeitung nach Art. 28 DSGVO.
      </p>
    ),
  },
  {
    id: "rechte",
    num: "10.",
    title: "Rechte der betroffenen Personen",
    body: (
      <>
        <p>Hinsichtlich Ihrer personenbezogenen Daten stehen Ihnen uns gegenüber die folgenden Rechte zu.</p>
        <ul>
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Haben Sie in die Verarbeitung eingewilligt, können Sie diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Zur Ausübung Ihrer Rechte genügt eine formlose
          Nachricht an <a href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "beschwerde",
    num: "11.",
    title: "Beschwerderecht bei der Aufsichtsbehörde",
    body: (
      <p>
        Unbeschadet anderweitiger Rechtsbehelfe steht Ihnen nach Art. 77 DSGVO ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu, insbesondere in dem Mitgliedstaat Ihres
        gewöhnlichen Aufenthalts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.
      </p>
    ),
  },
  {
    id: "sicherheit",
    num: "12.",
    title: "Datensicherheit",
    body: (
      <p>
        Wir setzen im Rahmen des Website-Besuchs eine Transportverschlüsselung (TLS) ein und treffen geeignete technische und organisatorische Maßnahmen, um Ihre Daten gegen zufällige
        oder vorsätzliche Manipulation, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen
        Entwicklung fortlaufend angepasst.
      </p>
    ),
  },
  {
    id: "aenderungen",
    num: "13.",
    title: "Änderungen dieser Datenschutzerklärung",
    body: (
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen
        umzusetzen. Für Ihren erneuten Besuch gilt dann die jeweils aktuelle Fassung.
      </p>
    ),
  },
];

export default function DatenschutzPage() {
  // Weiches Trennzeichen, damit das lange Wort auf schmalen Telefonen sauber umbricht
  return <LegalPage title={"Datenschutz­erklärung"} sections={sections} />;
}
