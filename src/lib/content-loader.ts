import { readFileSync } from "fs";
import { join } from "path";
import type { ContentData } from "./content";

const CONTENT_FILE = join(process.cwd(), "src/content/data/content.json");

// Server-side only function to load content at build time
export function loadContent(): ContentData {
  try {
    const data = readFileSync(CONTENT_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return default content if file doesn't exist
    return {
      hero: {
        name: "Your Name",
        bio: "Your bio goes here.",
        availableForWork: false,
        showResumeButton: true,
      },
      sections: {
        portfolioTitle: "Portfolio",
        experienceTitle: "Experience",
      },
      about: {
        title: "About me",
        description: "Your about section description.",
      },
      site: {
        name: "Your Name",
        description: "Your personal website",
        email: "your@email.com",
        linkedIn: "",
      },
      location: {
        city: "Vienna",
        country: "Austria",
      },
      experiences: [],
      skills: [],
    };
  }
}

// Convert experience dates from JSON strings to Date objects
export function getExperiences() {
  const content = loadContent();
  return content.experiences.map((exp) => ({
    ...exp,
    startedAt: new Date(exp.startedAt),
    endedAt: exp.endedAt ? new Date(exp.endedAt) : null,
  }));
}

export function getHeroContent() {
  const content = loadContent();
  return content.hero;
}

export function getAboutContent() {
  const content = loadContent();
  return content.about;
}

export function getSiteContent() {
  const content = loadContent();
  return content.site;
}

export function getSectionsContent() {
  const content = loadContent();
  return content.sections;
}

export function getLocationContent() {
  const content = loadContent();
  return content.location;
}

export function getSkills() {
  const content = loadContent();
  return content.skills || [];
}
