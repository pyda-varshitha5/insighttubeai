"use client";

import { useState } from "react";
import {
  FileText,
  Presentation,
  Share2,
  Bookmark,
} from "lucide-react";
import CopyButton from "./CopyButton";

interface SummaryActionsProps {
  markdown: string;
  title: string;
  onExportPdf?: () => void;
  onGeneratePpt?: () => void;
}

export default function SummaryActions({
  markdown,
  title,
  onExportPdf,
  onGeneratePpt,
}: SummaryActionsProps) {
  const [saved, setSaved] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title,
      text: `AI Study Guide: ${title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const secondaryButton =
    "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow";

  return (
    <div className="sticky top-4 z-50 mb-8 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-end gap-3">

        <button
          onClick={onExportPdf}
          className={secondaryButton}
        >
          <FileText size={18} />
          Export PDF
        </button>

        <button
          onClick={onGeneratePpt}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all duration-200 hover:bg-violet-700 hover:shadow-lg"
        >
          <Presentation size={18} />
          Generate PPT
        </button>

        <CopyButton
          getText={() => markdown}
          label="Copy Summary"
          className={secondaryButton}
        />

        <button
          onClick={handleShare}
          className={secondaryButton}
        >
          <Share2 size={18} />
          Share
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={
            saved
              ? "flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow transition hover:bg-emerald-700"
              : secondaryButton
          }
        >
          <Bookmark
            size={18}
            fill={saved ? "currentColor" : "none"}
          />
          {saved ? "Saved" : "Save"}
        </button>

      </div>
    </div>
  );
}