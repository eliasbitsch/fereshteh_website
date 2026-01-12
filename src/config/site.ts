import { type IconComponent, Icons } from "~/components/ui/icons";

export const siteConfig = {
  name: "Fereshteh Hosseini",
  url: "https://fereshteh-hosseini.com",
  description: "Fereshteh Hosseini's personal website",
  keywords:
    "Fereshteh Hosseini, Fereshteh, Hosseini, HCI, Human-Computer Interaction, UX Designer, UI Designer, User Experience, User Interface, Portfolio, Resume, Digital Experiences, Technology, Interaction Design",
  links: {
    linkedin: "https://www.linkedin.com/in/fereshteh-hosseini/",
  },
  email: "fereshteh.hosseini.at@gmail.com",
  repositoryName: "website",
};

export const navLinks = [
  { href: "#portfolio", label: "Portfolio" },
  { href: "#experience", label: "Experience" },
  { href: "#about", label: "About" },
  // { href: "/contributions", label: "Contributions" },
  // { href: "/contact", label: "Contact" },
] satisfies {
  href: string;
  label: string;
}[];

export const socialLinks: {
  label: string;
  icon: IconComponent;
  href: string;
}[] = [
  {
    label: "Gmail",
    icon: Icons.Mail,
    href: `mailto:${siteConfig.email}`,
  },
  {
    label: "LinkedIn",
    icon: Icons.LinkedIn,
    href: siteConfig.links.linkedin,
  },
];
