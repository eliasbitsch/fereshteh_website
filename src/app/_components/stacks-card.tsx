import Image from "next/image";
import { type Icon, Icons } from "~/components/ui/icons";
import { LinkPrimitive } from "~/components/ui/link";
import { Marquee } from "~/components/ui/marquee";
import {
  TooltipArrow,
  TooltipContent,
  TooltipRoot,
} from "~/components/ui/tooltip";
import type { SkillContent } from "~/lib/content";
import { withBasePath } from "~/lib/get-base-path";

interface StacksCardProps {
  skills?: SkillContent[];
}

export function StacksCard({ skills = [] }: StacksCardProps) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-xl border p-4 lg:p-6">
      <div className="flex items-center gap-2">
        <Icons.Zap className="size-4" />
        <h2 className="font-light text-sm">Skills</h2>
      </div>
      <Marquee className="my-auto py-4 [--gap:1.5rem]" pauseOnHover>
        {skills.map((skill) => {
          // Use custom icon if provided, otherwise use built-in icon
          const hasCustomIcon = skill.customIcon;
          const BuiltInIcon =
            skill.icon in Icons ? Icons[skill.icon as Icon] : null;

          return (
            <TooltipRoot closeDelay={0} delay={300} key={skill.name}>
              <LinkPrimitive
                aria-label={skill.name}
                href={skill.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {hasCustomIcon && (
                  <Image
                    alt={skill.name}
                    className="size-10"
                    height={40}
                    src={withBasePath(skill.customIcon!)}
                    width={40}
                  />
                )}
                {!hasCustomIcon && BuiltInIcon && (
                  <BuiltInIcon className="size-10" />
                )}
                {!(hasCustomIcon || BuiltInIcon) && (
                  <span className="flex size-10 items-center justify-center rounded bg-secondary font-medium text-xs">
                    {skill.name.slice(0, 2)}
                  </span>
                )}
              </LinkPrimitive>

              <TooltipContent>
                <TooltipArrow />
                {skill.name}
              </TooltipContent>
            </TooltipRoot>
          );
        })}
      </Marquee>
    </div>
  );
}
