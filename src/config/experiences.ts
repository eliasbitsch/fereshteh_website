export const experiences = [
  {
    title: "User Experience Designer",
    company: "Austrian Institute of Technology (AIT)",
    startedAt: new Date(2025, 5, 1), // June 2025
    endedAt: new Date(2026, 0, 1), // January 2026
    description:
      "Designed and improved HMIs in mobility sector projects with a user-centered approach. Enhanced sustainable mobility in the on-demand shuttle service (RIAMO project) by applying persuasive interface design strategies to encourage user engagement and adoption of eco-friendly transportation. Contributed to user research and interface design in the Tele operator crane system by conducting contextual inquiries and workshops to capture operator requirements, and translating insights into wireframes and prototypes to support the digitalization of crane operations.",
    skills: [
      "User Research",
      "Interface Design",
      "Wireframing",
      "Prototyping",
      "Contextual Inquiry",
      "Persuasive Design",
      "HMI Design",
      "User-Centered Design",
    ],
  },
  {
    title: "Product Design Intern",
    company: "TOSAN TECHNO and Productplan companies",
    startedAt: new Date(2022, 11, 1), // December 2022
    endedAt: new Date(2023, 4, 1), // May 2023
    description:
      "Redesigned user experience for ATM and cash register systems by conducting field studies, observations, and user interviews to identify pain points; performed qualitative analysis, led group brainstorming sessions, and created wireframes and Figma prototypes to improve navigation and workflow efficiency. Gained hands-on experience in product design principles under the mentorship of a 30-member expert team, with exposure to UX Writing, Service Design, Business Model Canvas, Agile methodologies, and analytics tools including Google Analytics and Google Tag Manager.",
    skills: [
      "User Research",
      "Field Studies",
      "Qualitative Analysis",
      "Wireframing",
      "Figma",
      "Prototyping",
      "UX Writing",
      "Service Design",
      "Business Model Canvas",
      "Agile",
      "Google Analytics",
      "Google Tag Manager",
    ],
  },
  {
    title: "Visual Design Specialist",
    company: "Pars Higher Education Institute of Art and Education",
    startedAt: new Date(2021, 8, 1), // September 2021
    endedAt: new Date(2023, 7, 1), // August 2023
    description:
      "Utilized advanced proficiency in Adobe Photoshop to create visually engaging graphics and layouts for digital interfaces, maintaining brand consistency and elevating user experience. Collaborated closely with cross-functional teams to conceptualize and execute design solutions, harnessing Photoshop's tools and features to optimize visual elements for web and mobile platforms.",
    skills: [
      "Adobe Photoshop",
      "Visual Design",
      "Brand Consistency",
      "Web Design",
      "Mobile Design",
      "Cross-functional Collaboration",
    ],
  },
  {
    title: "Software Engineer",
    company: "Shatel, Mobile Network Operator Company",
    startedAt: new Date(2015, 4, 1), // May 2015
    endedAt: new Date(2015, 8, 1), // September 2015
    description:
      "Initiated the development of a Log Management project using MongoDB, enhancing data storage and retrieval processes.",
    skills: ["MongoDB", "Log Management", "Software Development"],
  },
] satisfies {
  title: string;
  company: string;
  startedAt: Date;
  endedAt: Date | null;
  description: string;
  skills: string[];
}[];

export type Experience = (typeof experiences)[number];
