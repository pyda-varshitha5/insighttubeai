"use client";

import { useCallback, useState } from "react";
import {
  FileText,
  MonitorPlay,
  Copy,
  Share2,
  Bookmark,
  Loader2,
  Check,
} from "lucide-react";
import { Presentation } from "@/types/presentation";

interface SummaryActionsProps {
  title: string;
  markdown: string;
  onGeneratePpt?: () => void | Promise<void>;
  onCopySummary?: () => void | Promise<void>;
  onShare?: () => void | Promise<void>;
  onSave?: () => void | Promise<void>;
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : "Summary";
}

export default function SummaryActions({
  title,
  markdown,
  onGeneratePpt,
  onCopySummary,
  onShare,
  onSave,
}: SummaryActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          markdown,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to export PDF.";
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // response wasn't JSON, ignore
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const fileName = `${sanitizeFileName(title)}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export PDF failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while exporting the PDF."
      );
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, title, markdown]);

  const handleGeneratePpt = useCallback(async () => {
  if (isGeneratingPpt) return;

  setIsGeneratingPpt(true);

  try {
    if (onGeneratePpt) {
      await onGeneratePpt();
    }
  } finally {
    setIsGeneratingPpt(false);
  }
}, [isGeneratingPpt, onGeneratePpt]);
  const handleCopySummary = useCallback(async () => {
    try {
      if (onCopySummary) {
        await onCopySummary();
      } else {
        await navigator.clipboard.writeText(markdown);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Copy summary failed:", error);
    }
  }, [markdown, onCopySummary]);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      if (onShare) {
        await onShare();
      } else if (navigator.share) {
        await navigator.share({
          title,
          text: title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      // AbortError happens when the user cancels the native share sheet - ignore it
      if ((error as Error)?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, onShare, title]);

  const handleSave = useCallback(async () => {
    try {
      if (onSave) {
        await onSave();
      }
      setIsSaved(true);
    } catch (error) {
      console.error("Save failed:", error);
    }
  }, [onSave]);

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
      {/* Export PDF */}
      <button
        type="button"
        onClick={handleExportPdf}
        disabled={isExporting}
        aria-busy={isExporting}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isExporting ? "Exporting..." : "Export PDF"}
      </button>

      {/* Generate PPT */}
      <button
        type="button"
        onClick={handleGeneratePpt}
        disabled={isGeneratingPpt}
        aria-busy={isGeneratingPpt}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isGeneratingPpt ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MonitorPlay className="h-4 w-4" />
        )}
        {isGeneratingPpt ? "Generating..." : "Generate PPT"}
      </button>

      {/* Copy Summary */}
      <button
        type="button"
        onClick={handleCopySummary}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {isCopied ? "Copied!" : "Copy Summary"}
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        disabled={isSharing}
        aria-busy={isSharing}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
      >
        <Bookmark
          className={`h-4 w-4 ${isSaved ? "fill-gray-800" : ""}`}
        />
        {isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
}