import Image from "next/image";
import type { SkillContent } from "~/lib/content";
import { Icons, type Icon } from "~/components/ui/icons";
import { LinkPrimitive } from "~/components/ui/link";
import { Marquee } from "~/components/ui/marquee";
import {
  TooltipArrow,
  TooltipContent,
  TooltipRoot,
} from "~/components/ui/tooltip";
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
          const BuiltInIcon = skill.icon in Icons ? Icons[skill.icon as Icon] : null;

          return (
            <TooltipRoot closeDelay={0} delay={300} key={skill.name}>
              <LinkPrimitive
                aria-label={skill.name}
                href={skill.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {hasCustomIcon ? (
                  <Image
                    src={withBasePath(skill.customIcon!)}
                    alt={skill.name}
                    width={40}
                    height={40}
                    className="size-10"
                  />
                ) : BuiltInIcon ? (
                  <BuiltInIcon className="size-10" />
                ) : (
                  <span className="size-10 flex items-center justify-center text-xs font-medium bg-secondary rounded">
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
