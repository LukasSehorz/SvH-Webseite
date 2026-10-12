import Image from "next/image";
import { company } from "@/app/content";
import { footerB, navB } from "@/app/copy-b";

/* Fußzeile: dunkel wie die Leiste, rahmt die helle Seite ein. Die Abschnitts-Links (Reihenfolge wie
   das Menü) zeigen auf die Startseite („/#leistungen“), damit sie auch von Impressum, AGB usw. aus
   ins Ziel führen; auf der Startseite selbst springt der Browser ohne Neuladen zum Abschnitt.
   „Aktuelles“ führt zur Seite mit allen Videos. */
export default function Footer() {
  return (
    <footer className="fb">
      <div className="fb-grid shell">
        <div className="fb-marke">
          <Image src="/logo/svh-wort-96.webp" alt="SvH Consulting" width={169} height={22} />
          <p>{footerB.claim}</p>
        </div>
        <nav aria-label={footerB.bereiche}>
          <p className="fb-titel">{footerB.bereiche}</p>
          <ul className="fb-liste">
            {navB.links.map((l) => (
              <li key={l.id}>
                <a href={`/${l.href}`}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href="/aktuelles">Aktuelles</a>
            </li>
          </ul>
        </nav>
        <div>
          <p className="fb-titel">{footerB.kontakt}</p>
          <ul className="fb-liste">
            <li>
              <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
            </li>
            <li>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li className="fb-leise">{company.hours}</li>
          </ul>
        </div>
        <div>
          <p className="fb-titel">{footerB.seiten}</p>
          <ul className="fb-liste">
            {footerB.links.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="fb-copy shell">{footerB.copyright}</p>
    </footer>
  );
}
