"use client";

import * as m from "motion/react-m";
import { useEffect, useMemo, useState } from "react";
import { navLinks } from "~/config/site";
import { useActiveItem } from "~/hooks/use-active-item";
import { getBasePath } from "~/lib/get-base-path";
import { Icons } from "./ui/icons";

function isActive(href: string, activeSection: string | null) {
  if (href === "#") {
    return activeSection === "home";
  }
  return activeSection === href || `#${activeSection}` === href;
}

export function MainNav() {
  const sectionIds = useMemo(() => ['home', ...navLinks.map(link => link.href.replace('#', ''))], []);
  const activeSection = useActiveItem(sectionIds);
  const activeHref = activeSection ? `#${activeSection}` : "";
  const [hoveredPath, setHoveredPath] = useState(activeHref);

  useEffect(() => {
    setHoveredPath(activeHref);
  }, [activeHref]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const basePath = getBasePath();
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", basePath || "/");
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `${basePath}${href}`);
      }
    }
  };

  const allLinks = [{ href: "#", label: "Home" }, ...navLinks];

  return (
    <nav className="ml-6 hidden items-center text-sm md:flex">
      {allLinks.map((item, index) => {
        const itemActive = isActive(item.href, activeSection);
        return (
          <a
            className="relative px-3 py-2 text-fg/60 transition-colors hover:text-fg data-[active='true']:text-fg"
            data-active={itemActive}
            href={item.href}
            key={item.href}
            onClick={(e) => handleClick(e, item.href)}
            onMouseLeave={() => setHoveredPath(activeHref)}
            onMouseOver={() => setHoveredPath(item.href)}
          >
            {index === 0 ? (
              <Icons.Logo className="size-5" />
            ) : (
              <span>{item.label}</span>
            )}
            {isActive(item.href, hoveredPath === "" ? null : hoveredPath.replace('#', '')) ? (
              <m.div
                aria-hidden="true"
                className="absolute bottom-0 left-0 -z-10 size-full rounded-full bg-muted"
                layoutId="navbar"
                transition={{
                  duration: 0.15,
                }}
              />
            ) : null}
            {itemActive ? (
              <m.div
                aria-hidden="true"
                className="absolute bottom-0 left-0 -z-10 size-full rounded-full bg-muted"
                transition={{
                  duration: 0.15,
                }}
              />
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
