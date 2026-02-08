"use client";

import { useEffect } from "react";
import { Icons } from "~/components/ui/icons";

interface PDFViewerIframeProps {
  pdfUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFViewerIframe({
  pdfUrl,
  title,
  isOpen,
  onClose,
}: PDFViewerIframeProps) {
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Sticky header with back button */}
      <div className="sticky top-0 z-10 border-b bg-bg/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
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
      </div>

      {/* PDF iframe */}
      <div
        className="flex-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe className="size-full" src={pdfUrl} title={title} />
      </div>
    </div>
  );
}
