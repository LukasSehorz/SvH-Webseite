import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import SubpageHero from "../../components/SubpageHero";
import ContactCards from "../../components/company/ContactCards";
import ContactForm from "../../components/company/ContactForm";
import { Reveal } from "../../components/ui";
import { contactPage } from "../../content-pages";
import { company } from "../../content";

export const metadata: Metadata = {
  title: `${contactPage.metaTitle} – ${company.name}`,
  description: contactPage.metaDescription,
};

export default function KontaktPage() {
  return (
    <PageShell>
      <SubpageHero
        titleDark={contactPage.hero.titleDark}
        titleBrand={contactPage.hero.titleBrand}
        lead={contactPage.hero.lead}
        align="left"
        titleTone="brand"
        size="lg"
      />

      <ContactCards cards={contactPage.cards} facts={contactPage.facts} email={company.email} />

      <ContactForm
        title={contactPage.form.title}
        body={contactPage.form.body}
        fields={contactPage.form.fields}
        topics={contactPage.form.topics}
        consent={contactPage.form.consent}
        submit={contactPage.form.submit}
        success={contactPage.form.success}
      />

      {/* Kontaktdaten */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="kontaktdaten-title">
        <div className="shell">
          <Reveal>
            <h2 className="t-h3" id="kontaktdaten-title">
              So erreichen Sie uns
            </h2>
            <div
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              style={{
                marginTop: 32,
                borderTop: "1px solid var(--color-tint-1)",
                paddingTop: 32,
              }}
            >
              <div>
                <p className="t-eyebrow" style={{ fontSize: 12, color: "var(--color-brand-deep)" }}>
                  Anschrift
                </p>
                <address style={{ fontStyle: "normal", marginTop: 12, lineHeight: 1.6 }}>
                  {company.name}
                  <br />
                  {company.street}
                  <br />
                  {company.zipCity}
                  <br />
                  {company.country}
                </address>
              </div>

              <div>
                <p className="t-eyebrow" style={{ fontSize: 12, color: "var(--color-brand-deep)" }}>
                  Telefon &amp; E-Mail
                </p>
                <p style={{ marginTop: 12, lineHeight: 1.6 }}>
                  <a href={`tel:${company.phoneHref}`} style={{ textDecoration: "underline" }}>
                    {company.phone}
                  </a>
                  <br />
                  <a
                    href={`mailto:${company.email}`}
                    style={{ textDecoration: "underline", wordBreak: "break-word" }}
                  >
                    {company.email}
                  </a>
                </p>
              </div>

              <div>
                <p className="t-eyebrow" style={{ fontSize: 12, color: "var(--color-brand-deep)" }}>
                  Erreichbarkeit
                </p>
                <p style={{ marginTop: 12, lineHeight: 1.6 }}>{company.hours}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
