"use client";

import Image from "next/image";
import Link from "next/link";

interface PortfolioCardProps {
  title: string;
  thumbnailPath: string;
  slug: string;
}

export function PortfolioCard({
  title,
  thumbnailPath,
  slug,
}: PortfolioCardProps) {
  return (
    <Link
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-fg/20 hover:shadow-lg"
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
      <div className="p-4">
        <h3 className="font-medium text-sm md:text-base">{title}</h3>
      </div>
    </Link>
  );
}
