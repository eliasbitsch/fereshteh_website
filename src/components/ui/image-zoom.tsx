"use client";

import type { ComponentProps } from "react";

// Simple wrapper component for images with zoom capability
// Uses the image-zoom.css styles
export function ImageZoom({ className, ...props }: ComponentProps<"img">) {
  // biome-ignore lint/a11y/useAltText: Alt text is passed through props
  return <img className={className} {...props} />;
}
