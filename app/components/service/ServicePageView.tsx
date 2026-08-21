import type { ServicePage } from "../../content-pages";
import SubpageHero from "../SubpageHero";
import ProblemCompare from "./ProblemCompare";
import ComparisonTable from "./ComparisonTable";
import CapabilityGrid from "./CapabilityGrid";
import ServiceSteps from "./ServiceSteps";
import ServiceAudience from "./ServiceAudience";
import ServiceFaq from "./ServiceFaq";
import ServiceCta from "./ServiceCta";

/** Setzt aus einem `ServicePage`-Objekt die komplette Detailseite zusammen. */
export default function ServicePageView({ page }: { page: ServicePage }) {
  return (
    <>
      <SubpageHero
        eyebrow={page.hero.eyebrow}
        titleDark={page.hero.titleDark}
        titleBrand={page.hero.titleBrand}
        lead={page.hero.lead}
        cta={page.hero.cta}
        ctaHref="/unternehmen/kontakt"
      />
      <ProblemCompare problem={page.problem} />
      <ComparisonTable table={page.table} />
      <CapabilityGrid capabilities={page.capabilities} />
      <ServiceSteps steps={page.steps} />
      <ServiceAudience audience={page.audience} />
      <ServiceFaq items={page.faq} />
      <ServiceCta />
    </>
  );
}
