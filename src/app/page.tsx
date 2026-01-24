import { getProjectPdfItems } from "~/lib/projects-pdf";
import { AboutSection } from "./_components/about-me";
import { ExperienceSection } from "./_components/experience-section";
import { HeroSection } from "./_components/hero-section";
import { PortfolioSection } from "./_components/portfolio-section";
import {
  getHeroContent,
  getAboutContent,
  getExperiences,
  getSectionsContent,
  getLocationContent,
  getSkills,
} from "~/lib/content-loader";

export default function Home() {
  const projectItems = getProjectPdfItems();
  const heroContent = getHeroContent();
  const aboutContent = getAboutContent();
  const experiences = getExperiences();
  const sectionsContent = getSectionsContent();
  const locationContent = getLocationContent();
  const skills = getSkills();

  return (
    <main className="space-y-20">
      <HeroSection
        name={heroContent.name}
        bio={heroContent.bio}
        availableForWork={heroContent.availableForWork}
        showResumeButton={heroContent.showResumeButton}
      />
      <section id="portfolio" className="container scroll-mt-24 max-w-6xl">
        <h2 className="mb-10 font-semibold text-2xl md:text-3xl">{sectionsContent?.portfolioTitle || "Portfolio"}</h2>
        <PortfolioSection items={projectItems} />
      </section>
      <div id="experience" className="scroll-mt-24">
        <ExperienceSection experiences={experiences} title={sectionsContent?.experienceTitle} />
      </div>
      <div id="about" className="scroll-mt-24">
        <AboutSection
          title={aboutContent.title}
          description={aboutContent.description}
          location={locationContent}
          skills={skills}
        />
      </div>
    </main>
  );
}
