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

export function PortfolioListClient({ items }: PortfolioListClientProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8">
      {items.map((item) => (
        <PortfolioCard
          key={item.pdfPath}
          slug={item.title}
          subtitle={item.subtitle}
          thumbnailPath={item.thumbnailPath}
          title={item.title}
        />
      ))}
    </div>
  );
}
