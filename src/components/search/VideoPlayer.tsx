"use client";

import { X } from "lucide-react";

interface Props {
  videoId: string;
  open: boolean;
  onClose: () => void;
}

export default function VideoPlayer({
  videoId,
  open,
  onClose,
}: Props) {
  if (!open || !videoId) {
    return null;
  }

  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-[90vw] max-w-5xl rounded-2xl bg-white p-4 shadow-2xl">
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-sm hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {/* YouTube video */}
        <div className="aspect-video overflow-hidden rounded-xl">
          <iframe
            key={videoId}
            src={youtubeUrl}
            title="YouTube Player"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

      </div>
    </div>
  );
}