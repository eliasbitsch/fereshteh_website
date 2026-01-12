"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const PDFViewerClean = dynamic(
  () => import("../../_components/pdf-viewer-clean").then((mod) => ({ default: mod.PDFViewerClean })),
  { ssr: false }
);

interface PortfolioItem {
  title: string;
  pdfPath: string;
  thumbnailPath: string;
}

interface PortfolioViewerProps {
  item: PortfolioItem;
}

export function PortfolioViewer({ item }: PortfolioViewerProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push("/#portfolio");
  };

  return (
    <PDFViewerClean
      isOpen={true}
      onClose={handleClose}
      pdfUrl={
        item.pdfPath
          .split("/")
          .map((seg, i) => (i === 0 ? "" : encodeURIComponent(seg)))
          .join("/")
      }
      title={item.title}
    />
  );
}
