import type { Metadata } from "next";
import { company } from "@/app/content";
import LegalPage, { type LegalSection } from "@/components/pages/LegalPage";
import { pageMeta } from "@/components/pages/meta";

/*
 * Impressum. Inhalt unverändert von der alten Seite übernommen
 * (SvH-Webseite/app/impressum/page.tsx), nur das Layout ist neu.
 */

export const metadata: Metadata = pageMeta({
  title: "Impressum",
  description: `Angaben gemäß § 5 DDG für ${company.name} (${company.legalName}), ${company.zipCity}.`,
  path: "/impressum",
});

const sections: LegalSection[] = [
  {
    id: "angaben",
    title: "Angaben gemäß § 5 DDG",
    body: (
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
    ),
  },
  {
    id: "vertreten",
    title: "Vertreten durch",
    body: <p>Vertretungsberechtigte Gesellschafter sind {company.partners.join(" und ")}.</p>,
  },
  {
    id: "kontakt",
    title: "Kontakt",
    body: (
      <dl className="lg-dl">
        <dt>Telefon</dt>
        <dd>
          <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
        </dd>
        <dt>E-Mail</dt>
        <dd>
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </dd>
        <dt>Erreichbarkeit</dt>
        <dd>{company.hours}</dd>
      </dl>
    ),
  },
  {
    id: "ust-id",
    title: "Umsatzsteuer-Identifikationsnummer",
    body: <p>Die Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz teilen wir auf Anfrage mit.</p>,
  },
  {
    id: "verantwortlich",
    title: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
    body: (
      <p>
        {company.partners[0]}
        <br />
        {company.street || company.streetPending}
        <br />
        {company.zipCity}
        <br />
        {company.country}
      </p>
    ),
  },
  {
    id: "haftung-inhalte",
    title: "Haftung für Inhalte",
    body: (
      <>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
          Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
          erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen entfernen wir diese Inhalte umgehend.
        </p>
      </>
    ),
  },
  {
    id: "haftung-links",
    title: "Haftung für Links",
    body: (
      <>
        <p>
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
          übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
          Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>
        <p>
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
          Rechtsverletzungen entfernen wir derartige Links umgehend.
        </p>
      </>
    ),
  },
  {
    id: "urheberrecht",
    title: "Urheberrecht",
    body: (
      <>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und
          jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser
          Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
        </p>
        <p>
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
          gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
          Rechtsverletzungen entfernen wir solche Inhalte umgehend.
        </p>
      </>
    ),
  },
  {
    id: "streitschlichtung",
    title: "Hinweis zur EU-Streitschlichtung",
    body: (
      <>
        <p>
          Die Europäische Kommission stellt unter{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>{" "}
          eine Plattform zur Online-Streitbeilegung bereit. Unsere E-Mail-Adresse finden Sie oben in diesem Impressum.
        </p>
        <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </>
    ),
  },
];

export default function ImpressumPage() {
  return <LegalPage title="Impressum" sections={sections} />;
}
