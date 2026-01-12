import type { Icon } from "~/components/ui/icons";

export const technologies = [
  {
    name: "Figma",
    icon: "Figma",
    url: "https://www.figma.com",
  },
  {
    name: "Adobe XD",
    icon: "AdobeXD",
    url: "https://www.adobe.com/products/xd.html",
  },
  {
    name: "Photoshop",
    icon: "Photoshop",
    url: "https://www.adobe.com/products/photoshop.html",
  },
  {
    name: "PenPod",
    icon: "Penpot",
    url: "https://www.penpod.com",
  },
  {
    name: "Balsamiq",
    icon: "Balsamiq",
    url: "https://balsamiq.com",
  },
  {
    name: "Unity",
    icon: "Unity",
    url: "https://unity.com",
  },
  {
    name: "Arduino",
    icon: "Arduino",
    url: "https://www.arduino.cc",
  },
  {
    name: "R Studio",
    icon: "RStudio",
    url: "https://www.rstudio.com",
  },
  {
    name: "SPSS",
    icon: "SPSS",
    url: "https://www.ibm.com/products/spss-statistics",
  },
  {
    name: "HTML",
    icon: "HTML",
    url: "https://html.spec.whatwg.org",
  },
  {
    name: "CSS",
    icon: "CSS",
    url: "https://www.w3.org/Style/CSS",
  },
  {
    name: "JavaScript",
    icon: "JavaScript",
    url: "https://www.javascript.com",
  },
  {
    name: "React.js",
    icon: "React",
    url: "https://reactjs.org",
  },
  {
    name: "Shadcn UI Library",
    icon: "ShadcnUI",
    url: "https://ui.shadcn.com",
  },
] as const satisfies Technology[];

export interface Technology {
  name: string;
  url: string;
  icon: Icon;
}
export type Technologies = typeof technologies;
export type TechnologyName = Technologies[number]["name"];

type TechnologyMap = {
  [T in TechnologyName]: Extract<Technologies[number], { name: T }>;
};

export function getTechnology<T extends TechnologyName>(name: T) {
  return technologies.find((t) => t.name === name) as TechnologyMap[T];
}
