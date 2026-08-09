"use client";

import { Clock3, Sparkles, Star } from "lucide-react";

export default function HistoryIllustration() {
  return (
    <div className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-violet-100 via-white to-purple-100 p-6 lg:block">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-200/40 blur-2xl" />

      <Sparkles className="absolute right-6 top-6 h-4 w-4 text-violet-400" />

      <Star className="absolute bottom-8 right-8 h-4 w-4 text-violet-300" />

      <div className="relative flex min-h-[150px] items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg shadow-violet-200">
          <Clock3 className="h-10 w-10 text-violet-500" />
        </div>
      </div>
    </div>
  );
}