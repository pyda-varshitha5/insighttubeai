"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { YouTubeVideo } from "./SearchPage";

interface Props {
  videos: YouTubeVideo[];
  loading: boolean;
  onPlay: (id: string) => void;
}

function formatViews(views: string) {
  const n = Number(views);

  if (n >= 1000000)
    return (n / 1000000).toFixed(1).replace(".0", "") + "M views";

  if (n >= 1000)
    return (n / 1000).toFixed(1).replace(".0", "") + "K views";

  return n + " views";
}

function formatDuration(duration: string) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return "";

  const h = match[1] || "";
  const m = match[2] || "0";
  const s = match[3] || "0";

  if (h)
    return `${h}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;

  return `${m}:${s.padStart(2, "0")}`;
}

export default function VideoTable({
  videos,
  loading,
  onPlay,
}: Props) {
  if (loading)
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow">
        Loading...
      </div>
    );

  if (videos.length === 0)
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow">
        No videos found.
      </div>
    );

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow">

      <div className="grid grid-cols-12 border-b bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-600">

        <div className="col-span-1">#</div>

        <div className="col-span-7">Video</div>

        <div className="col-span-2">Views</div>

        <div className="col-span-2 text-right">
          Action
        </div>

      </div>

      {videos.map((video, index) => (

        <div
          key={video.id}
          className="grid grid-cols-12 items-center border-b px-6 py-5 hover:bg-gray-50"
        >

          <div className="col-span-1">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700 font-semibold">
              {index + 1}
            </div>

          </div>

          <div className="col-span-7 flex items-center gap-4">

<button
  onClick={() => onPlay(video.id)}
  className="relative h-20 w-36 overflow-hidden rounded-xl border border-gray-200 transition hover:scale-[1.02]"
>
  <Image
    src={video.thumbnail}
    alt={video.title}
    fill
    unoptimized
    className="object-cover"
  />

  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition hover:opacity-100">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
      ▶
    </div>
  </div>

  <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
    {formatDuration(video.duration)}
  </div>
</button>

            <div>

<h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-gray-900">                {video.title}
              </h3>

<p className="mt-1 text-sm text-gray-500">                {video.channel}
              </p>

            </div>

          </div>

<div className="col-span-2">            
  <span className="text-sm font-medium text-gray-700">
  {formatViews(video.views)}
</span>
          </div>

          <div className="col-span-2 flex justify-end">

            <button
  onClick={() => onPlay(video.id)}
  className="inline-flex items-center gap-2 rounded-xl border border-violet-300 bg-white px-5 py-2.5 text-sm font-medium text-violet-600 transition hover:bg-violet-50"
>
  Watch
  <ExternalLink className="h-4 w-4" />
</button>

          </div>

        </div>

      ))}

    </div>
  );
}