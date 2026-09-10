import Link from "next/link";
import { footer, nav, einwilligung } from "../../copy";
import ConsentWiderruf from "./ConsentWiderruf";
import { company } from "../../content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-veil" aria-hidden="true" />
      <hr className="hairline" />

      <div className="shell footer-inner">
        <div className="footer-grid">
          {footer.columns.map((column) => (
            <div key={column.title}>
              <p className="t-label" style={{ marginBottom: 18 }}>
                {column.title}
              </p>
              <ul className="footer-list">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="t-label" style={{ marginBottom: 18 }}>
              {nav.contact.label}
            </p>
            <ul className="footer-list">
              <li>
                <a href={`tel:${company.phoneHref}`} className="footer-link">
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="footer-link">
                  {company.email}
                </a>
              </li>
              {/* Diese beiden Zeilen tragen keinen Verweis. Sie bekommen
                  die Klasse, damit die schmale Fassung ihnen denselben
                  Abstand in halber Hoehe geben kann wie den Verweisen
                  darueber, deren Beruehrflaeche dort auf rund
                  fuenfundvierzig Bildpunkte waechst. */}
              <li className="footer-plain" style={{ color: "var(--ink-2)" }}>
                {company.street}
                <br />
                {company.zipCity}
              </li>
              <li className="footer-plain" style={{ color: "var(--ink-3)" }}>
                {company.hours}
              </li>
            </ul>
          </div>
        </div>

        <img
          className="footer-watermark"
          src="/logo/svh-wort-2400.webp"
          alt={footer.watermark}
          width={2400}
          height={312}
          loading="lazy"
          decoding="async"
        />

        <hr className="hairline" style={{ background: "var(--line-2)" }} />

        <div className="footer-legal">
          <p className="t-label" style={{ textTransform: "none", letterSpacing: "0.02em" }}>
            © {year} {company.legalName}
          </p>
          {/* Hier stand dieselbe Reihe aus Impressum, Datenschutz und AGB
              noch einmal, obwohl sie zwei Handbreit darueber schon als
              Spalte Rechtliches steht. Zwei Wege zu derselben Seite in
              einem Blickfeld lassen den Leser suchen, welcher der richtige
              ist. Die Spalte bleibt, denn sie steht in copy.ts neben den
              anderen Spalten. */}
          {/* Der Widerruf der Einwilligung. Er musz so leicht zu finden
              sein wie die Zustimmung selbst, deshalb steht er dauerhaft in
              der Fusszeile und nicht in der Datenschutzerklaerung
              versteckt. */}
          <ConsentWiderruf label={einwilligung.widerruf} />

          <p className="t-label" style={{ textTransform: "none", letterSpacing: "0.02em" }}>
            {footer.claim}
          </p>
        </div>
      </div>
    </footer>
  );
}
