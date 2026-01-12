import { socialLinks } from "~/config/site";
import { LinkButton } from "./ui/button";
import { TooltipArrow, TooltipContent, TooltipRoot } from "./ui/tooltip";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="my-12 flex flex-col items-center justify-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {socialLinks.map((link) => (
          <TooltipRoot delay={300} key={link.href}>
            <LinkButton
              aria-label={link.label}
              href={link.href}
              rel="noopener noreferrer"
              size="icon"
              target="_blank"
              variant="outline"
            >
              <link.icon className="size-5" />
            </LinkButton>
            <TooltipContent>
              <TooltipArrow />
              {link.label}
            </TooltipContent>
          </TooltipRoot>
        ))}
      </div>
      <p className="text-center text-muted-fg text-sm">
        © {currentYear} by Fereshteh Hosseini. All rights reserved.
      </p>
    </footer>
  );
}
