import { contact } from "@/content/contact";
import { hero } from "@/content/hero";
import { marquee } from "@/content/marquee";
import { navItems, primaryCta, products } from "@/content/navigation";
import { site } from "@/content/site";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CompanyIntro } from "@/components/sections/CompanyIntro";
import { ContactSection } from "@/components/sections/ContactSection";
import { DataHubShowcase } from "@/components/sections/DataHubShowcase";
import { HeroSection } from "@/components/sections/HeroSection";
import { PathTableSection } from "@/components/sections/PathTableSection";
import { ShopShowcase } from "@/components/sections/ShopShowcase";
import { SolutionsIndex } from "@/components/sections/SolutionsIndex";
import { TechnologyMarquee } from "@/components/sections/TechnologyMarquee";
import { ValueStrip } from "@/components/sections/ValueStrip";
import { WhySection } from "@/components/sections/WhySection";

/**
 * The single page, in the order of the visitor journey ("Signal to Insight"):
 * Hero (dark) → Value strip (dark) → Marquee (gold band) → Introduction (light) → Solutions (white)
 * → IoTDataHub (dark) → Shop (light) → Which do you need? (light) → Why (dark) → CTA (dark gradient)
 * → Footer (deepest navy).
 */
export default function HomePage() {
  return (
    <>
      <Navbar
        brandName={site.name.text}
        links={navItems}
        products={products}
        cta={primaryCta}
        email={contact.email}
        phone={contact.phone}
        phoneDisplay={contact.phoneDisplay}
      />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <HeroSection content={hero} />
        <ValueStrip />
        <TechnologyMarquee
          label={marquee.label}
          items={marquee.items}
          verified={marquee.verified}
        />
        <CompanyIntro />
        <SolutionsIndex />
        <DataHubShowcase />
        <ShopShowcase />
        <PathTableSection />
        <WhySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
