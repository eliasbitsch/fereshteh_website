"use client";

import * as m from "motion/react-m";
import { useEffect, useState } from "react";
import { navLinks } from "~/config/site";
import { useHash } from "~/hooks/use-hash";
import { Icons } from "./ui/icons";

function isActive(href: string, hash: string) {
  return hash === href;
}

export function MainNav() {
  const hash = useHash();
  const [hoveredPath, setHoveredPath] = useState(hash);

  useEffect(() => {
    setHoveredPath(hash);
  }, [hash]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  const allLinks = [{ href: "#", label: "Home" }, ...navLinks];

  return (
    <nav className="ml-6 hidden items-center text-sm md:flex">
      {allLinks.map((item, index) => (
        <a
          className="relative px-3 py-2 text-fg/60 transition-colors hover:text-fg data-[active='true']:text-fg"
          data-active={isActive(item.href, hash) || (item.href === "#" && !hash)}
          href={item.href}
          key={item.href}
          onClick={(e) => handleClick(e, item.href)}
          onMouseLeave={() => setHoveredPath(hash)}
          onMouseOver={() => setHoveredPath(item.href)}
        >
          {index === 0 ? (
            <Icons.Logo className="size-5" />
          ) : (
            <span>{item.label}</span>
          )}
          {isActive(item.href, hoveredPath) || (item.href === "#" && hoveredPath === "" && !hash) ? (
            <m.div
              aria-hidden="true"
              className="absolute bottom-0 left-0 -z-10 size-full rounded-full bg-muted"
              layoutId="navbar"
              transition={{
                duration: 0.15,
              }}
            />
          ) : null}
          {isActive(item.href, hash) || (item.href === "#" && !hash) ? (
            <m.div
              aria-hidden="true"
              className="absolute bottom-0 left-0 -z-10 size-full rounded-full bg-muted"
              transition={{
                duration: 0.15,
              }}
            />
          ) : null}
        </a>
      ))}
    </nav>
  );
}
