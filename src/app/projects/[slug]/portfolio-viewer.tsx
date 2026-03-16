"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";

interface PortfolioItem {
  title: string;
  pdfPath: string;
  thumbnailPath: string;
  imagePath: string;
  imagePaths: string[];
}

interface PortfolioViewerProps {
  item: PortfolioItem;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const ZOOM_ANIMATION_MS = 200;

function useResponsiveBaseWidth() {
  const [baseWidth, setBaseWidth] = useState(700);
  const lastWidth = useRef(0);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (Math.abs(w - lastWidth.current) < 10) return;
      lastWidth.current = w;
      setBaseWidth(Math.min(Math.round(w * 0.75), 1000));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return baseWidth;
}

export function PortfolioViewer({ item }: PortfolioViewerProps) {
  const router = useRouter();
  const baseWidth = useResponsiveBaseWidth();
  const [zoom, setZoom] = useState(1);
  const [isAnimatingZoom, setIsAnimatingZoom] = useState(false);
  const isDraggingRef = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const scrollStartX = useRef(0);
  const scrollStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Check if we have pre-rendered images (not just PDF path)
  const hasImages = item.imagePaths.length > 0 && !item.imagePaths[0]?.endsWith(".pdf");

  const handleClose = () => {
    router.push("/#projects");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.pdfPath;
    link.download = `${item.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const animateZoom = useCallback((oldZoom: number, newZoom: number) => {
    const container = scrollContainerRef.current;
    if (!container || oldZoom === newZoom) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsAnimatingZoom(true);

    const startScrollLeft = container.scrollLeft;
    const startScrollTop = container.scrollTop;
    const scrollCenterX = startScrollLeft + container.clientWidth / 2;
    const scrollCenterY = startScrollTop + container.clientHeight / 2;

    const scale = newZoom / oldZoom;
    const targetScrollLeft = scrollCenterX * scale - container.clientWidth / 2;
    const targetScrollTop = scrollCenterY * scale - container.clientHeight / 2;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / ZOOM_ANIMATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;

      container.scrollLeft =
        startScrollLeft + (targetScrollLeft - startScrollLeft) * eased;
      container.scrollTop =
        startScrollTop + (targetScrollTop - startScrollTop) * eased;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimatingZoom(false);
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(
    () => () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    []
  );

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    if (newZoom !== zoom) {
      animateZoom(zoom, newZoom);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    if (newZoom !== zoom) {
      animateZoom(zoom, newZoom);
      setZoom(newZoom);
    }
  };

  const handleResetZoom = () => {
    if (zoom !== 1) {
      animateZoom(zoom, 1);
      setZoom(1);
    }
  };

  const handleJumpToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScroll = useCallback(() => {
    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
    setIsAtTop(scrollTop < 10);
  }, []);

  // Native drag-to-scroll — bypasses React for zero overhead
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (zoomRef.current <= 1) return;
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDraggingState(true);
      dragStartX.current = e.clientX;
      dragStartY.current = e.clientY;
      scrollStartX.current = el.scrollLeft;
      scrollStartY.current = el.scrollTop;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      el.scrollLeft = scrollStartX.current + (dragStartX.current - e.clientX);
      el.scrollTop = scrollStartY.current + (dragStartY.current - e.clientY);
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsDraggingState(false);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => {
        const newZoom = Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM);
        const container = scrollContainerRef.current;
        if (container && prev !== newZoom) {
          const scrollCenterX = container.scrollLeft + container.clientWidth / 2;
          const scrollCenterY = container.scrollTop + container.clientHeight / 2;
          const scale = newZoom / prev;
          container.scrollLeft = scrollCenterX * scale - container.clientWidth / 2;
          container.scrollTop = scrollCenterY * scale - container.clientHeight / 2;
        }
        return newZoom;
      });
    }
  }, []);

  const imageWidth = Math.round(baseWidth * zoom);

  return (
    <div className="fixed inset-0 z-[60] bg-bg">
      <div className="relative flex h-full w-full flex-col bg-bg">
        <div className="sticky top-0 z-10 border-b bg-bg px-2 py-2 sm:px-4 sm:py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <Button
                className="shrink-0"
                onClick={handleClose}
                size="sm"
                variant="ghost"
              >
                <Icons.ChevronLeft className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="truncate font-semibold text-base sm:text-xl">
                {item.title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {!isAtTop && (
                <Button
                  aria-label="Jump to top"
                  className="size-10 sm:size-11"
                  onPress={handleJumpToTop}
                  size="icon"
                  variant="outline"
                >
                  <Icons.ArrowUp className="size-5" />
                </Button>
              )}
              <div className="flex h-10 items-center gap-1 rounded-lg border bg-bg p-1 sm:h-11 sm:gap-1.5 sm:p-1.5">
                <Button
                  aria-label="Zoom out"
                  className="size-8 sm:size-9"
                  isDisabled={zoom <= MIN_ZOOM}
                  onPress={handleZoomOut}
                  size="icon"
                  variant="ghost"
                >
                  <Icons.Minus className="size-4 sm:size-5" />
                </Button>
                <span className="min-w-[3rem] text-center text-xs sm:min-w-[3.5rem] sm:text-sm">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  aria-label="Zoom in"
                  className="size-8 sm:size-9"
                  isDisabled={zoom >= MAX_ZOOM}
                  onPress={handleZoomIn}
                  size="icon"
                  variant="ghost"
                >
                  <Icons.Plus className="size-4 sm:size-5" />
                </Button>
                <Button
                  aria-label="Reset zoom"
                  className="size-8 sm:size-9"
                  isDisabled={zoom === 1}
                  onPress={handleResetZoom}
                  size="icon"
                  variant="ghost"
                >
                  <Icons.Maximize className="size-4 sm:size-5" />
                </Button>
              </div>
              <Button
                className="h-10 sm:h-11"
                onClick={handleDownload}
                size="sm"
                variant="outline"
              >
                <Icons.Download className="size-5 sm:mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
        <div
          className="flex-1 overflow-auto"
          onScroll={handleScroll}
          onWheel={handleWheel}
          ref={scrollContainerRef}
          style={{
            cursor:
              zoom <= 1
                ? "default"
                : isDraggingState
                  ? "grabbing"
                  : "grab",
            willChange: "scroll-position",
          }}
        >
          <div className="inline-flex min-h-full min-w-full justify-center p-2 sm:p-4">
            <div
              style={{
                width: `${imageWidth}px`,
                maxWidth: "none",
                transition: isAnimatingZoom
                  ? `width ${ZOOM_ANIMATION_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
                  : "none",
              }}
            >
              {hasImages ? (
                // Show pre-rendered images — instant loading
                (item.imagePaths).map((src, index, arr) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    alt={
                      arr.length > 1
                        ? `${item.title} - part ${index + 1}`
                        : item.title
                    }
                    className={`block h-auto w-full select-none will-change-transform ${
                      index === 0 ? "rounded-t-lg" : "-mt-px"
                    } ${index === arr.length - 1 ? "rounded-b-lg" : ""}`}
                    draggable={false}
                    loading="eager"
                    src={src}
                  />
                ))
              ) : (
                // No pre-rendered images — show PDF path as fallback
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-muted-fg text-sm">
                      Preview images are being generated...
                    </span>
                    <span className="text-muted-fg text-xs">
                      Refresh the page in a moment.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
