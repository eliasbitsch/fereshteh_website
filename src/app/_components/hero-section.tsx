"use client";

import Image from "next/image";
import { BadgeAnimated } from "~/components/ui/badge-animated";
import { LinkButton } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { withBasePath } from "~/lib/get-base-path";
import { ScrollIndicator } from "./scroll-indicator";

interface HeroSectionProps {
  name: string;
  bio: string;
  availableForWork?: boolean;
  showResumeButton?: boolean;
}

export function HeroSection({ name, bio, availableForWork, showResumeButton = true }: HeroSectionProps) {
  return (
    <section id="home" className="relative flex items-center justify-center overflow-hidden rounded-md py-20 pb-32 md:py-20 md:pb-50 scroll-mt-20">
      <GridPattern />
      <ShadowEffect />

      <div className="container max-w-6xl space-y-4">
        <div className="grid justify-items-center gap-4">
          <div className="size-[250px] animate-delay-100 animate-fade-up">
            <Image
              src={withBasePath("/profile-picture/fereshteh_portrait.avif")}
              alt="Portrait"
              width={250}
              height={250}
              className="rounded-full"
            />
          </div>
        </div>
        {availableForWork ? (
          <div className="flex justify-center mt-20">
            <BadgeAnimated className="flex items-center gap-2 text-sm animate-delay-300 animate-fade-up">
              <Icons.Circle className="size-2 animate-pulse fill-success text-success" />
              Available for work
            </BadgeAnimated>
          </div>
        ) : (
          <div className="h-6 mt-20" />
        )}
        <h1 className="animate-delay-300 animate-fade-up text-center font-bold text-5xl md:text-7xl">
          {name}
        </h1>
        <p className="mx-auto max-w-lg animate-delay-300 animate-fade-up text-balance text-center text-muted-fg">
          {bio}
        </p>
        {showResumeButton ? (
          <div className="flex animate-delay-400 animate-fade-up items-center justify-center gap-5">
            <LinkButton
              className="group rounded-full"
              href={withBasePath("/documents/cv_Fereshteh_Hosseini.pdf")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icons.Download className="mr-2 size-4" />
              Get resume
            </LinkButton>
          </div>
        ) : (
          <div className="h-10" />
        )}
      </div>

      <ScrollIndicator />
    </section>
  );
}

function GridPattern() {
  return (
    <svg
      aria-hidden="true"
      className="mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] absolute inset-0 -z-10 size-full stroke-white/10"
    >
      <defs>
        <pattern
          height={200}
          id="a"
          patternUnits="userSpaceOnUse"
          width={200}
          x="50%"
          y={-1}
        >
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <svg className="overflow-visible fill-fg/5" x="50%" y={-1}>
        <path d="M-200 0H1v201h-201zm800 0h201v201H600zM-400 600h201v201h-201zm600 200h201v201H200z" />
      </svg>
      <rect fill="url(#a)" height="100%" width="100%" />
    </svg>
  );
}

function ShadowEffect() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
    >
      <div
        className="aspect-1108/632 w-277 bg-linear-to-r from-[#80caff] to-[#4f46e5] opacity-20"
        style={{
          clipPath:
            "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
        }}
      />
    </div>
  );
}
