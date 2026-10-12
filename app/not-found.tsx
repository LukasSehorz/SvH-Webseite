import type { Metadata } from "next";
import { notFound } from "@/app/copy";
import Cta from "@/components/system/Cta";
import PageHead from "@/components/pages/PageHead";

/* Seite nicht gefunden: schlicht, ein Satz, ein Weg zurück. Leiste und Fußzeile kommen aus dem Layout. */

export const metadata: Metadata = {
  title: notFound.metaTitle,
  robots: { index: false, follow: false },
  alternates: { canonical: null }, // nicht die Startseite als kanonisch erben
};

export default function NotFound() {
  return (
    <main id="inhalt" className="nf">
      <PageHead label={notFound.label} title={notFound.title} lead={notFound.lead} center>
        <div className="nf-aktion">
          {/* inline={false}: kein Sektionsknopf, die Leiste behält ihren Knopf */}
          <Cta href="/" inline={false}>
            {notFound.home}
          </Cta>
        </div>
      </PageHead>
    </main>
  );
}
