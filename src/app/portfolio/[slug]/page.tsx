import { notFound } from "next/navigation";
import { getPortfolioItems } from "~/lib/portfolio";
import { PortfolioViewer } from "./portfolio-viewer";

export async function generateStaticParams() {
  const items = getPortfolioItems();

  return items.map((item) => ({
    slug: encodeURIComponent(item.title),
  }));
}

interface PortfolioPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const items = getPortfolioItems();
  const decodedSlug = decodeURIComponent(slug);

  const item = items.find((i) => i.title === decodedSlug);

  if (!item) {
    notFound();
  }

  return <PortfolioViewer item={item} />;
}
