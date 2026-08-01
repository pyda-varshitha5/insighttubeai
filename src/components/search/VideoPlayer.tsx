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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-[90vw] max-w-5xl rounded-2xl bg-white p-4 shadow-2xl">

        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <div className="aspect-video overflow-hidden rounded-xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube Player"
            className="h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}