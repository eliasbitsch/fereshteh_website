"use client";

import { PortfolioCard } from "./portfolio-card";

interface PortfolioItem {
  title: string;
  subtitle?: string | null;
  pdfPath: string;
  thumbnailPath: string;
}

interface PortfolioListClientProps {
  items: PortfolioItem[];
}

export default function PortfolioListClient({
  items,
}: PortfolioListClientProps) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {items.map((item) => (
        <PortfolioCard
          key={item.pdfPath}
          slug={item.title}
          thumbnailPath={item.thumbnailPath}
          title={item.title}
          subtitle={item.subtitle}
        />
      ))}
    </div>
  );
}
