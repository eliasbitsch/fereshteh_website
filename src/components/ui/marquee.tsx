"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/cva";

export interface MarqueeProps extends React.ComponentProps<"div"> {
  pauseOnHover?: boolean;
  reverse?: boolean;
  children: React.JSX.Element[];
}

export function Marquee({
  pauseOnHover = false,
  reverse = false,
  className,
  children,
  ...props
}: MarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout>();
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  if (!children) {
    return null;
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Prevent default to avoid any text selection
      e.preventDefault();
      isDraggingRef.current = true;
      setIsPaused(true);
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      container.style.cursor = "grabbing";
      container.style.userSelect = "none";

      // Clear any existing resume timer
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 2;
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (container) {
        container.style.cursor = "grab";
        container.style.userSelect = "";
      }

      // Resume animation after 2 seconds
      resumeTimerRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 2000);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Only reset if we're dragging and mouse actually left the container
      if (isDraggingRef.current && e.target === container) {
        isDraggingRef.current = false;
        container.style.cursor = "grab";
        container.style.userSelect = "";

        // Resume animation after 2 seconds
        resumeTimerRef.current = setTimeout(() => {
          setIsPaused(false);
        }, 2000);
      }
    };

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
      // Ensure we reset state on cleanup
      isDraggingRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group flex gap-(--gap) overflow-x-scroll",
        "[--duration:40s] [--gap:1rem]",
        "mask-[linear-gradient(to_right,transparent_0,black_128px,black_calc(100%-128px),transparent_100%)]",
        "cursor-grab select-none",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      role="marquee"
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 animate-marquee items-center gap-(--gap)",
          pauseOnHover && "group-hover:animate-pause",
          isPaused && "animate-pause",
          reverse && "animate-reverse"
        )}
      >
        {children}
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex shrink-0 animate-marquee items-center gap-(--gap)",
          pauseOnHover && "group-hover:animate-pause",
          isPaused && "animate-pause",
          reverse && "animate-reverse"
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
