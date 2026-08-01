"use client";

import { ArrowRight, FileText, BadgeHelp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
interface SearchActionCardsProps {
  topic: string;
}

export default function SearchActionCards({
  topic,
}: SearchActionCardsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">

      {/* AI Summary */}
<button
  onClick={() => {
    if (!topic.trim()) return;

    router.push(
  `/summary?topic=${encodeURIComponent(topic)}&from=results`
);
  }}
  className="group flex items-center gap-3 rounded-2xl border border-violet-200 bg-white px-5 py-4 shadow-sm transition hover:border-violet-400 hover:shadow-md"
>       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
          <FileText className="h-5 w-5 text-violet-600" />
        </div>

        <div className="text-left">
          <h3 className="text-sm font-semibold text-slate-900">
            View AI Summary
          </h3>

          <p className="text-xs text-slate-500">
            Get AI summary from top videos
          </p>
        </div>

        <ArrowRight className="ml-2 h-4 w-4 text-violet-600" />
      </button>

      {/* Quiz */}
      <button className="group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <BadgeHelp className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="text-left">
          <h3 className="text-sm font-semibold text-slate-900">
            Generate Quiz
          </h3>

          <p className="text-xs text-slate-500">
            Test your understanding
          </p>
        </div>

        <ArrowRight className="ml-2 h-4 w-4 text-emerald-600" />
      </button>

    </div>
  );
}