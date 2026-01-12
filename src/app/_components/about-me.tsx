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
          I'm a full-stack developer based in Vienna, Austria, with a passion
          for creating elegant and efficient web applications. I specialize in
          building modern, responsive interfaces and robust backend systems that
          deliver exceptional user experiences.
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
