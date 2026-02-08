"use client";

import { PortfolioCard } from "./portfolio-card";

interface PortfolioItem {
  title: string;
  pdfPath: string;
  thumbnailPath: string;
}

interface PortfolioListProps {
  items: PortfolioItem[];
}

export function PortfolioList({ items }: PortfolioListProps) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {items.map((item) => (
        <PortfolioCard
          key={item.pdfPath}
          slug={item.title}
          thumbnailPath={item.thumbnailPath}
          title={item.title}
        />
      ))}
    </div>
  );
}

export function PortfolioListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          className="flex flex-col overflow-hidden rounded-xl border bg-card"
          key={`skeleton-${i}`}
        >
          <div className="aspect-[16/9] w-full animate-pulse bg-muted" />
          <div className="p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
