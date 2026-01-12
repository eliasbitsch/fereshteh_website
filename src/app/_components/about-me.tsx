import * as m from "motion/react-m";
import { Connect } from "./connect";
import { LocationCard } from "./location-card";
import { StacksCard } from "./stacks-card";

export function AboutSection() {
  return (
    <section className="container max-w-6xl">
      <h2 className="mb-10 font-semibold text-2xl md:text-3xl">About me</h2>

      <div className="mb-8 max-w-3xl">
        <p className="text-muted-fg leading-relaxed">
        Welcome to my UI/UX design portfolio! I'm passionate about creating intuitive and visually stunning experiences for users. With a keen eye for detail and a deep understanding of user behavior, I strive to craft designs that not only look beautiful but also function seamlessly. My portfolio showcases a collection of projects where I have combined creativity and user-centered design principles to deliver exceptional results. Each project is a story of problem-solving, creativity, and innovation. Feel free to explore and get in touch to discuss how we can collaborate on your next design venture.
        </p>
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
          <StacksCard />
        </div>
        <div className="grid gap-4">
          <LocationCard />
        </div>
      </m.div>
    </section>
  );
}
