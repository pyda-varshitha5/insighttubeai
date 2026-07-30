"use client";

import { Laptop } from "lucide-react";

export default function LearningBanner() {
  return (
    <div className="bg-violet-50 rounded-2xl border border-violet-100 p-6 flex items-center justify-between gap-6 overflow-hidden">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          Learn Smarter, Not Harder
        </h3>

        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
          InsightTube-AI combines the best YouTube videos into one structured
          AI summary, helping you understand concepts faster and save valuable
          learning time.
        </p>

        <button className="mt-5 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600">
          Start Learning
        </button>
      </div>

      <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-violet-100 sm:flex">
        <Laptop className="text-violet-500" size={38} />
      </div>
    </div>
  );
}