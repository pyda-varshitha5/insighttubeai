"use client";

import Image from "next/image";
import { ExternalLink, PlayCircle } from "lucide-react";

const videos = [
  {
    id: 1,
    title: "React Hooks Tutorial for Beginners",
    channel: "Programming with Mosh",
    views: "2.3M views",
    duration: "24:35",
    thumbnail: "https://i.ytimg.com/vi/TNhaISOUy6Q/hqdefault.jpg",
    url: "#",
  },
  {
    id: 2,
    title: "React Hooks Crash Course",
    channel: "Traversy Media",
    views: "1.8M views",
    duration: "18:21",
    thumbnail: "https://i.ytimg.com/vi/f687hBjwFcM/hqdefault.jpg",
    url: "#",
  },
  {
    id: 3,
    title: "Master React Hooks in One Video",
    channel: "Codevolution",
    views: "1.2M views",
    duration: "42:10",
    thumbnail: "https://i.ytimg.com/vi/O6P86uwfdR0/hqdefault.jpg",
    url: "#",
  },
  {
    id: 4,
    title: "React useEffect Explained",
    channel: "Web Dev Simplified",
    views: "980K views",
    duration: "15:02",
    thumbnail: "https://i.ytimg.com/vi/0ZJgIjIuY7U/hqdefault.jpg",
    url: "#",
  },
  {
    id: 5,
    title: "React useState Complete Guide",
    channel: "CodeWithHarry",
    views: "850K views",
    duration: "29:50",
    thumbnail: "https://i.ytimg.com/vi/O6P86uwfdR0/hqdefault.jpg",
    url: "#",
  },
  {
    id: 6,
    title: "React Hooks Interview Questions",
    channel: "JavaScript Mastery",
    views: "620K views",
    duration: "20:11",
    thumbnail: "https://i.ytimg.com/vi/f687hBjwFcM/hqdefault.jpg",
    url: "#",
  },
  {
    id: 7,
    title: "Learn React Hooks Fast",
    channel: "Academind",
    views: "500K views",
    duration: "16:45",
    thumbnail: "https://i.ytimg.com/vi/TNhaISOUy6Q/hqdefault.jpg",
    url: "#",
  },
  {
    id: 8,
    title: "React Custom Hooks",
    channel: "PedroTech",
    views: "420K views",
    duration: "14:32",
    thumbnail: "https://i.ytimg.com/vi/O6P86uwfdR0/hqdefault.jpg",
    url: "#",
  },
  {
    id: 9,
    title: "Top React Hooks Tips",
    channel: "Fireship",
    views: "390K views",
    duration: "9:40",
    thumbnail: "https://i.ytimg.com/vi/f687hBjwFcM/hqdefault.jpg",
    url: "#",
  },
  {
    id: 10,
    title: "React Hooks Best Practices",
    channel: "freeCodeCamp.org",
    views: "300K views",
    duration: "35:12",
    thumbnail: "https://i.ytimg.com/vi/TNhaISOUy6Q/hqdefault.jpg",
    url: "#",
  },
];

export default function VideoTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-7 py-6">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
            <PlayCircle className="h-6 w-6 text-violet-600" />
          </div>

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Top 10 YouTube Videos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ranked by relevance
            </p>

          </div>

        </div>

      </div>

      {/* Table Header */}

      <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-7 py-4 text-sm font-semibold text-slate-600">

        <div className="col-span-1">
          #
        </div>

        <div className="col-span-6">
          Video
        </div>

        <div className="col-span-2">
          Views
        </div>

        <div className="col-span-3 text-right">
          Action
        </div>

      </div>

      {/* Rows */}
            {videos.map((video) => (
        <div
          key={video.id}
          className="grid grid-cols-12 items-center border-b border-slate-100 px-7 py-5 transition-all duration-200 hover:bg-slate-50"
        >
          {/* Number */}
          <div className="col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-sm font-semibold text-violet-700">
              {video.id}
            </div>
          </div>

          {/* Video */}
          <div className="col-span-6 flex items-center gap-4">
            <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {video.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {video.channel}
              </p>

              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                {video.duration}
              </span>
            </div>
          </div>

          {/* Views */}
          <div className="col-span-2">
            <span className="text-sm font-medium text-slate-600">
              {video.views}
            </span>
          </div>

          {/* Action */}
          <div className="col-span-3 flex justify-end">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-600 transition-all duration-200 hover:border-violet-500 hover:bg-violet-50"
            >
              Watch on YouTube

              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      ))}
          </div>
  );
}