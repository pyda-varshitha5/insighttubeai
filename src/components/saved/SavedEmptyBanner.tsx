import { Bookmark, Sparkles, Star, Leaf } from "lucide-react";

export default function SavedEmptyBanner() {
  return (
    <div className="flex flex-col items-center gap-8 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-violet-100/50 p-8 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row">
      {/* Left: illustration */}
      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
        {/* Soft glow */}
        <div className="absolute h-24 w-24 rounded-full bg-violet-300/40 blur-2xl" />

        {/* Decorative sparkles */}
        <Sparkles className="absolute left-0 top-1 h-3.5 w-3.5 text-violet-400" />
        <Star className="absolute right-1 top-3 h-3 w-3 text-violet-300" />
        <Sparkles className="absolute right-0 bottom-8 h-2.5 w-2.5 text-violet-300" />

        {/* Central circle with bookmark */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-violet-100">
          <Bookmark className="h-9 w-9 text-violet-600" strokeWidth={1.75} />
        </div>

        {/* Decorative plants */}
        <div className="absolute -bottom-1 -left-1 h-7 w-7 rounded-full bg-violet-200/70" />
        <Leaf className="absolute bottom-1 left-0.5 h-3.5 w-3.5 text-violet-500" />

        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-violet-200/70" />
        <Leaf className="absolute bottom-1 right-0.5 h-3.5 w-3.5 -scale-x-100 text-violet-500" />
      </div>

      {/* Right: text */}
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-semibold text-slate-900">
          Bookmark knowledge that matters
        </h3>
        <p className="mt-1.5 text-sm text-slate-500">
          Save summaries and searches you find useful and access them
          anytime.
        </p>
      </div>
    </div>
  );
}