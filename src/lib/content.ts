import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CONTENT_FILE = join(process.cwd(), "src/content/data/content.json");

export interface HeroContent {
  name: string;
  bio: string;
  availableForWork: boolean;
  showResumeButton: boolean;
}

export interface AboutContent {
  title: string;
  description: string;
}

export interface SiteContent {
  name: string;
  description: string;
  email: string;
  linkedIn: string;
  profilePictureVersion?: number;
}

export interface SectionsContent {
  portfolioTitle: string;
  experienceTitle: string;
}

export interface LocationContent {
  city: string;
  country: string;
}

export interface SkillContent {
  name: string;
  icon: string;
  url: string;
  customIcon?: string; // path to custom SVG in /public/icons/
}

export interface ExperienceContent {
  id: string;
  title: string;
  company: string;
  startedAt: string;
  endedAt: string | null;
  description: string;
  skills: string[];
}

export interface ContentData {
  hero: HeroContent;
  sections: SectionsContent;
  about: AboutContent;
  site: SiteContent;
  location: LocationContent;
  experiences: ExperienceContent[];
  skills: SkillContent[];
}

export function getContent(): ContentData {
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

export function saveContent(content: ContentData): void {
  writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2));
}

export function updateHero(hero: Partial<HeroContent>): ContentData {
  const content = getContent();
  content.hero = { ...content.hero, ...hero };
  saveContent(content);
  return content;
}

export function updateSections(
  sections: Partial<SectionsContent>
): ContentData {
  const content = getContent();
  content.sections = { ...content.sections, ...sections };
  saveContent(content);
  return content;
}

export function updateAbout(about: Partial<AboutContent>): ContentData {
  const content = getContent();
  content.about = { ...content.about, ...about };
  saveContent(content);
  return content;
}

export function updateSite(site: Partial<SiteContent>): ContentData {
  const content = getContent();
  content.site = { ...content.site, ...site };
  saveContent(content);
  return content;
}

export function updateLocation(
  location: Partial<LocationContent>
): ContentData {
  const content = getContent();
  content.location = { ...content.location, ...location };
  saveContent(content);
  return content;
}

export function updateExperience(experience: ExperienceContent): ContentData {
  const content = getContent();
  const index = content.experiences.findIndex((e) => e.id === experience.id);

  if (index >= 0) {
    content.experiences[index] = experience;
  } else {
    content.experiences.push(experience);
  }

  saveContent(content);
  return content;
}

export function deleteExperience(id: string): ContentData {
  const content = getContent();
  content.experiences = content.experiences.filter((e) => e.id !== id);
  saveContent(content);
  return content;
}

export function reorderExperiences(ids: string[]): ContentData {
  const content = getContent();
  const experienceMap = new Map(content.experiences.map((e) => [e.id, e]));
  content.experiences = ids
    .map((id) => experienceMap.get(id))
    .filter((e): e is ExperienceContent => e !== undefined);
  saveContent(content);
  return content;
}

export function updateSkills(skills: SkillContent[]): ContentData {
  const content = getContent();
  content.skills = skills;
  saveContent(content);
  return content;
}

export function incrementProfilePictureVersion(): number {
  const content = getContent();
  const currentVersion = content.site.profilePictureVersion || 1;
  const newVersion = currentVersion + 1;
  content.site.profilePictureVersion = newVersion;
  saveContent(content);
  return newVersion;
}
