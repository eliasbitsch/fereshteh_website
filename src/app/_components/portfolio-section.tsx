"use client";

import dynamic from "next/dynamic";
import { PortfolioListSkeleton } from "./portfolio-list";

const PortfolioList = dynamic(() => import("./portfolio-list-client"), {
  ssr: false,
  loading: () => <PortfolioListSkeleton />,
});

interface PortfolioItem {
  title: string;
  subtitle?: string | null;
  pdfPath: string;
  thumbnailPath: string;
}

interface PortfolioSectionProps {
  items: PortfolioItem[];
}

export function PortfolioSection({ items }: PortfolioSectionProps) {
  return <PortfolioList items={items} />;
}
