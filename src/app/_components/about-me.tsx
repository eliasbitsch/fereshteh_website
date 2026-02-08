import * as m from "motion/react-m";
import type { SkillContent } from "~/lib/content";
import { Connect } from "./connect";
import { LocationCard } from "./location-card";
import { StacksCard } from "./stacks-card";

interface AboutSectionProps {
  title: string;
  description: string;
  location?: { city: string; country: string };
  skills?: SkillContent[];
}

export function AboutSection({
  title,
  description,
  location,
  skills,
}: AboutSectionProps) {
  return (
    <section className="container max-w-6xl">
      <h2 className="mb-10 font-semibold text-2xl md:text-3xl">{title}</h2>

      <div className="mb-8 max-w-3xl">
        <p className="text-muted-fg leading-relaxed">{description}</p>
      </div>

      <m.div
        className="motion grid gap-4 md:grid-cols-2"
        initial={{
          y: 40,
          opacity: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        whileInView={{
          y: 0,
          opacity: 1,
        }}
      >
        <div className="grid gap-4">
          <Connect />
          <StacksCard skills={skills} />
        </div>
        <div className="grid gap-4">
          <LocationCard city={location?.city} country={location?.country} />
        </div>
      </m.div>
    </section>
  );
}
