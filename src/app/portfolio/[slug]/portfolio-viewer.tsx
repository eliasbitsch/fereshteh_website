"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
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

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const BASE_WIDTH = 896; // max-w-4xl in pixels

export function PortfolioViewer({ item }: PortfolioViewerProps) {
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const scrollStartX = useRef(0);
  const scrollStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleJumpToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScroll = useCallback(() => {
    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
    setIsAtTop(scrollTop < 10);
  }, []);

  // Drag to pan (scroll) the image
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartY.current = e.clientY;
      scrollStartX.current = scrollContainerRef.current?.scrollLeft ?? 0;
      scrollStartY.current = scrollContainerRef.current?.scrollTop ?? 0;
    },
    [zoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      const deltaX = dragStartX.current - e.clientX;
      const deltaY = dragStartY.current - e.clientY;
      scrollContainerRef.current.scrollLeft = scrollStartX.current + deltaX;
      scrollContainerRef.current.scrollTop = scrollStartY.current + deltaY;
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Ctrl/Cmd + scroll to zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom((prev) => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
      }
    },
    []
  );

  const imageWidth = Math.round(BASE_WIDTH * zoom);

  return (
    <div className="fixed inset-0 z-[60] bg-bg">
      <div className="relative flex h-full w-full flex-col bg-bg">
        <div className="sticky top-0 z-10 border-b bg-bg px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button onClick={handleClose} variant="ghost" size="sm">
                <Icons.ChevronLeft className="mr-2 size-4" />
                Back
              </Button>
              <h1 className="font-semibold text-xl">{item.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {!isAtTop && (
                <Button
                  onPress={handleJumpToTop}
                  variant="outline"
                  size="icon"
                  title="Jump to top"
                  className="size-10"
                >
                  <Icons.ArrowUp className="size-4" />
                </Button>
              )}
              <div className="flex h-10 items-center gap-1 rounded-lg border bg-bg p-1">
                <Button
                  onPress={handleZoomOut}
                  variant="ghost"
                  size="icon"
                  isDisabled={zoom <= MIN_ZOOM}
                  title="Zoom out"
                  className="size-8"
                >
                  <Icons.Minus className="size-4" />
                </Button>
                <span className="min-w-[3rem] text-center text-sm">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  onPress={handleZoomIn}
                  variant="ghost"
                  size="icon"
                  isDisabled={zoom >= MAX_ZOOM}
                  title="Zoom in"
                  className="size-8"
                >
                  <Icons.Plus className="size-4" />
                </Button>
                <Button
                  onPress={handleResetZoom}
                  variant="ghost"
                  size="icon"
                  isDisabled={zoom === 1}
                  title="Reset zoom"
                  className="size-8"
                >
                  <Icons.Maximize className="size-4" />
                </Button>
              </div>
              <Button onClick={handleDownload} variant="outline" size="sm" className="h-10">
                <Icons.Download className="mr-2 size-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onScroll={handleScroll}
          style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
        >
          <div className="inline-flex min-h-full min-w-full justify-center p-4">
            <Image
              src={item.imagePath}
              alt={item.title}
              width={1200}
              height={1600}
              className="h-auto rounded-lg border select-none"
              style={{
                width: `${imageWidth}px`,
                maxWidth: "none",
                transition: isDragging ? "none" : "width 0.2s ease-out",
              }}
              priority
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
