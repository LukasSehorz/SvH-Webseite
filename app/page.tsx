import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import IntroStatement from "./components/IntroStatement";
import ImpactSection from "./components/ImpactSection";
import ShowcaseVideo from "./components/ShowcaseVideo";
import ServicesSection from "./components/ServicesSection";
import ProcessSection from "./components/ProcessSection";
import ProblemsSection from "./components/ProblemsSection";
import RoiCalculator from "./components/RoiCalculator";
import OfferingsSection from "./components/OfferingsSection";
import Testimonials from "./components/Testimonials";
import StatsBanner from "./components/StatsBanner";
import AudienceSection from "./components/AudienceSection";
import ResourcesSection from "./components/ResourcesSection";
import NewsletterSection from "./components/NewsletterSection";
import FaqSection from "./components/FaqSection";
import FinalCta from "./components/FinalCta";
import SiteFooter from "./components/SiteFooter";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <IntroStatement />
        <ImpactSection />
        <ShowcaseVideo />
        <ServicesSection />
        <ProcessSection />
        <ProblemsSection />
        <RoiCalculator />
        <OfferingsSection />
        <Testimonials />
        <StatsBanner />
        <AudienceSection />
        <ResourcesSection />
        <NewsletterSection />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
