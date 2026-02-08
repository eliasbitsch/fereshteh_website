"use client";

import { useEffect, useState } from "react";

export function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute -bottom-0 left-1/2 -translate-x-1/2">
      <div className="flex flex-col items-center gap-2">
        <span className="font-light text-fg/60 text-sm">Scroll</span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-fg/20 p-1">
          <div className="size-1.5 animate-scroll-down rounded-full bg-fg/40" />
        </div>
        <div className="animate-arrow-down-1 text-fg/40">↓</div>
      </div>
    </div>
  );
}
