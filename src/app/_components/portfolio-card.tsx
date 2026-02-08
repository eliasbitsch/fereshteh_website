"use client";

import Image from "next/image";
import Link from "next/link";

interface PortfolioCardProps {
  title: string;
  subtitle?: string | null;
  thumbnailPath: string;
  slug: string;
}

export function PortfolioCard({
  title,
  subtitle,
  thumbnailPath,
  slug,
}: PortfolioCardProps) {
  return (
    <Link
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:border-fg/20 hover:shadow-lg sm:rounded-xl"
      href={`/portfolio/${encodeURIComponent(slug)}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          alt={title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={thumbnailPath}
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 font-medium text-sm sm:text-base">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 line-clamp-1 text-muted-fg text-xs sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
