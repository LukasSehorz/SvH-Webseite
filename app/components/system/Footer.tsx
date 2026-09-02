import Link from "next/link";
import { footer, nav } from "../../copy";
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
              <li style={{ color: "var(--ink-2)" }}>
                {company.street}
                <br />
                {company.zipCity}
              </li>
              <li style={{ color: "var(--ink-3)" }}>{company.hours}</li>
            </ul>
          </div>
        </div>

        <p className="footer-watermark" aria-hidden="true">
          {footer.watermark}
        </p>

        <hr className="hairline" style={{ background: "var(--line-2)" }} />

        <div className="footer-legal">
          <p className="t-label" style={{ textTransform: "none", letterSpacing: "0.02em" }}>
            © {year} {company.legalName}
          </p>
          <nav aria-label="Rechtliche Seiten" className="footer-legal-links">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/agb">AGB</Link>
          </nav>
          <p className="t-label" style={{ textTransform: "none", letterSpacing: "0.02em" }}>
            {footer.claim}
          </p>
        </div>
      </div>
    </footer>
  );
}
