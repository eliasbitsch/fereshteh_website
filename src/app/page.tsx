import { getPortfolioItems } from "~/lib/portfolio";
import { AboutSection } from "./_components/about-me";
import { ExperienceSection } from "./_components/experience-section";
import { HeroSection } from "./_components/hero-section";
import { env } from "~/config/env";
import { PortfolioSection } from "./_components/portfolio-section";

export default function Home() {
  const portfolioItems = getPortfolioItems();

  return (
    <main className="space-y-20">
      <HeroSection availableForWork={env.AVAILABLE_FOR_WORK} />
      <section id="portfolio" className="container scroll-mt-24 max-w-6xl">
        <h2 className="mb-10 font-semibold text-2xl md:text-3xl">Portfolio</h2>
        <PortfolioSection items={portfolioItems} />
      </section>
      <div id="experience" className="scroll-mt-24">
        <ExperienceSection />
      </div>
      <div id="about" className="scroll-mt-24">
        <AboutSection />
      </div>
    </main>
  );
}
