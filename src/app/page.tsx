import {
  getAboutContent,
  getExperiences,
  getHeroContent,
  getLocationContent,
  getSectionsContent,
  getSkills,
} from "~/lib/content-loader";
import { getProjectPdfItems } from "~/lib/projects-pdf";
import { AboutSection } from "./_components/about-me";
import { ExperienceSection } from "./_components/experience-section";
import { HeroSection } from "./_components/hero-section";
import { PortfolioSection } from "./_components/portfolio-section";

// Disable caching - always fetch fresh content
export const dynamic = "force-dynamic";

export default function Home() {
  const projectItems = getProjectPdfItems();
  const heroContent = getHeroContent();
  const aboutContent = getAboutContent();
  const experiences = getExperiences();
  const sectionsContent = getSectionsContent();
  const locationContent = getLocationContent();
  const skills = getSkills();

  return (
    <main className="space-y-12 sm:space-y-16 md:space-y-20">
      <HeroSection
        availableForWork={heroContent.availableForWork}
        bio={heroContent.bio}
        name={heroContent.name}
        profilePictureVersion={heroContent.profilePictureVersion}
        showResumeButton={heroContent.showResumeButton}
      />
      <section
        className="container max-w-6xl scroll-mt-20 sm:scroll-mt-24"
        id="portfolio"
      >
        <h2 className="mb-6 font-semibold text-xl sm:mb-8 sm:text-2xl md:mb-10 md:text-3xl">
          {sectionsContent?.portfolioTitle || "Portfolio"}
        </h2>
        <PortfolioSection items={projectItems} />
      </section>
      <div className="scroll-mt-24" id="experience">
        <ExperienceSection
          experiences={experiences}
          title={sectionsContent?.experienceTitle}
        />
      </div>
      <div className="scroll-mt-24" id="about">
        <AboutSection
          description={aboutContent.description}
          location={locationContent}
          skills={skills}
          title={aboutContent.title}
        />
      </div>
    </main>
  );
}
