"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icons } from "~/components/ui/icons";
import { Button } from "~/components/ui/button";

interface PortfolioItem {
  title: string;
  pdfPath: string;
  thumbnailPath: string;
  imagePath: string;
}

interface PortfolioViewerProps {
  item: PortfolioItem;
}

export function PortfolioViewer({ item }: PortfolioViewerProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push("/#portfolio");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.pdfPath;
    link.download = `${item.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-bg">
      <div className="relative h-full w-full overflow-auto bg-bg">
        <div className="sticky top-0 z-10 border-b bg-bg px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button onClick={handleClose} variant="ghost" size="sm">
                <Icons.ChevronLeft className="mr-2 size-4" />
                Back
              </Button>
              <h1 className="font-semibold text-xl">{item.title}</h1>
            </div>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Icons.Download className="mr-2 size-4" />
              Download PDF
            </Button>
          </div>
        </div>
        <div className="flex justify-center p-4">
          <Image
            src={item.imagePath}
            alt={item.title}
            width={1200}
            height={1600}
            className="h-auto w-full max-w-4xl rounded-lg border"
            priority
          />
        </div>
      </div>
    </div>
  );
}
