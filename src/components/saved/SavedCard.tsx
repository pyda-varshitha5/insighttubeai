"use client";

import { useRouter } from "next/navigation";
import { Bookmark, MoreVertical, LucideIcon } from "lucide-react";

interface SavedCardProps {
  id: string;
  icon: LucideIcon;
  iconGradient: string;
  iconColor: string;
  title: string;
  description: string;
  readTime: string;
  date: string;
  time: string;
  isLast?: boolean;
  onDelete?: (id: string) => void;
}

export default function SavedCard({
  id,
  icon: Icon,
  iconGradient,
  iconColor,
  title,
  description,
  readTime,
  date,
  time,
  isLast = false,
  onDelete,
}: SavedCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/summary/saved?id=${id}`)}
      className={`cursor-pointer flex flex-col gap-4 px-6 py-5 transition-all duration-200 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${
        isLast ? "" : "border-b border-slate-100"
      }`}
    >
      {/* Left Side */}
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {description}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
              Summary
            </span>

            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              {readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
        <div className="text-right">
          <p className="text-xs text-slate-400">Saved on</p>
          <p className="text-sm font-medium text-slate-700">{date}</p>
          <p className="text-xs text-slate-500">{time}</p>
        </div>

        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-violet-600"
          >
            <Bookmark className="h-4 w-4 fill-violet-600 text-violet-600" />
          </button>
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();

    if (confirm("Remove this saved summary?")) {
      onDelete?.(id);
    }
  }}
  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
>
  <MoreVertical className="h-4 w-4" />
</button>
        </div>
      </div>
    </div>
  );
}