"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Icons } from "~/components/ui/icons";
import { SiteFooter } from "~/components/site-footer";

// Set up PDF.js worker - using CDN for reliability
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  // Suppress canvas error warnings from PDF.js
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Canvas is already in error state')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

interface PDFViewerCleanProps {
  pdfUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFViewerClean({
  pdfUrl,
  title,
  isOpen,
  onClose,
}: PDFViewerCleanProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setContainerWidth(width - 32);
      } else if (width < 1024) {
        setContainerWidth(width - 64);
      } else {
        setContainerWidth(Math.min(width * 0.7, 1200));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  function onDocumentLoadSuccess({ numPages: pages }: { numPages: number }) {
    setNumPages(pages);
  }

  const handleZoomIn = () => {
    if (isZooming) return;

    const newScale = Math.min(scale + 0.25, 3);
    if (newScale === scale) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Store current scroll position before zoom
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    setIsZooming(true);
    setScale(newScale);

    // Use requestAnimationFrame to restore scroll position after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          // Maintain the same scroll position (no adjustment)
          scrollContainerRef.current.scrollLeft = scrollLeft;
          scrollContainerRef.current.scrollTop = scrollTop;
        }
        setIsZooming(false);
      });
    });
  };

  const handleZoomOut = () => {
    if (isZooming) return;

    const newScale = Math.max(scale - 0.25, 0.5);
    if (newScale === scale) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Store current scroll position before zoom
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    setIsZooming(true);
    setScale(newScale);

    // Use requestAnimationFrame to restore scroll position after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          // Maintain the same scroll position (no adjustment)
          scrollContainerRef.current.scrollLeft = scrollLeft;
          scrollContainerRef.current.scrollTop = scrollTop;
        }
        setIsZooming(false);
      });
    });
  };

  const handleFit = () => {
    if (scale !== 1) {
      setScale(1);
    }
  };

  const handleJumpToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        left: scrollContainerRef.current.scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Consider scrolled down if more than 50px from top
      setIsScrolledDown(container.scrollTop > 50);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (scale > 1 && e.button === 0) {
        isDraggingRef.current = true;
        startPosRef.current = {
          x: e.clientX + container.scrollLeft,
          y: e.clientY + container.scrollTop,
        };
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dx = startPosRef.current.x - e.clientX;
      const dy = startPosRef.current.y - e.clientY;

      container.scrollLeft = dx;
      container.scrollTop = dy;
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        container.style.cursor = scale > 1 ? 'grab' : 'default';
        container.style.userSelect = '';
      }
    };

    const handleMouseLeave = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        container.style.cursor = scale > 1 ? 'grab' : 'default';
        container.style.userSelect = '';
      }
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Initialize scroll state
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scale]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/98 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Sticky header with back button and controls */}
      <div
        className="sticky top-0 z-10 border-b bg-bg/95 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              aria-label="Close PDF viewer"
              className="flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-muted"
              onClick={onClose}
              type="button"
            >
              <Icons.ChevronLeft className="size-4" />
              <span className="font-medium text-sm">Back</span>
            </button>
            <h2 className="font-semibold text-lg">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              aria-label="Zoom out"
              className="rounded-lg border p-2 transition-colors hover:bg-muted disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={scale <= 0.5 || isZooming}
              type="button"
            >
              <Icons.Minus className="size-4" />
            </button>
            <span className="min-w-16 text-center text-sm">{Math.round(scale * 100)}%</span>
            <button
              aria-label="Zoom in"
              className="rounded-lg border p-2 transition-colors hover:bg-muted disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={scale >= 3 || isZooming}
              type="button"
            >
              <Icons.Plus className="size-4" />
            </button>

            {/* Fit button */}
            <button
              aria-label="Fit to page"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                handleFit();
              }}
              disabled={scale === 1}
              type="button"
            >
              <Icons.Maximize className="size-4" />
              <span className="font-medium text-sm">Fit</span>
            </button>

            {/* Jump to top button */}
            <button
              aria-label="Jump to top"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                handleJumpToTop();
              }}
              disabled={!isScrolledDown}
              type="button"
            >
              <Icons.ArrowUp className="size-4" />
              <span className="font-medium text-sm">Top</span>
            </button>

            {/* Download button */}
            <button
              aria-label="Download PDF"
              className="flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              type="button"
            >
              <Icons.Download className="size-4" />
              <span className="font-medium text-sm">Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF content */}
      <div
        className="flex-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollContainerRef}
          className="size-full overflow-auto"
          style={{
            cursor: scale > 1 ? 'grab' : 'default',
          }}
        >
          <div
            className="flex min-h-full items-start justify-center py-8"
            style={{
              minWidth: `${containerWidth * scale}px`,
            }}
          >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              width: `${containerWidth}px`,
            }}
          >
            <Document
              className="flex flex-col items-center gap-4"
              file={pdfUrl}
              loading={
                <div className="flex min-h-screen items-center justify-center">
                  <div className="text-muted-fg">Loading PDF...</div>
                </div>
              }
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error("Error loading PDF:", error);
              }}
            >
              {Array.from(new Array(numPages), (_el, index) => {
                // Always render at a safe canvas size to avoid white screens
                const safeRenderWidth = Math.min(containerWidth, 1200);

                return (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    width={safeRenderWidth}
                    devicePixelRatio={1}
                    className="shadow-lg"
                    loading={
                      <div className="flex h-[800px] items-center justify-center" style={{ width: `${safeRenderWidth}px` }}>
                        <div className="text-muted-fg">Loading page {index + 1}...</div>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center p-4">
                        <div className="text-muted-fg">Error loading page</div>
                      </div>
                    }
                  />
                );
              })}
            </Document>

            {/* Footer below PDF */}
            <div className="mt-8">
              <SiteFooter />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
