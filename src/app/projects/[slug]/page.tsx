import { notFound } from "next/navigation";
import { getProjectPdfItems } from "~/lib/projects-pdf";
import { PortfolioViewer } from "./portfolio-viewer";

export const metadata = {
  title: "Portfolio",
};

// Always fetch fresh content
export const dynamic = "force-dynamic";
// Generate pages dynamically on first request
export const dynamicParams = true;

export async function generateStaticParams() {
  const items = getProjectPdfItems();

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
  const items = getProjectPdfItems();
  const decodedSlug = decodeURIComponent(slug);

  const item = items.find((i) => i.title === decodedSlug);

  if (!item) {
    notFound();
  }

  return <PortfolioViewer item={item} />;
}
