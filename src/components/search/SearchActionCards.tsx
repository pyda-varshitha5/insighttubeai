"use client";

import {
  ArrowRight,
  FileText,
  BadgeHelp,
  Presentation,
  FileDown,
} from "lucide-react";

export default function SearchActionCards() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">

      {/* AI Summary */}
      <button className="group flex items-center justify-between rounded-2xl border border-violet-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-400 hover:shadow-lg">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <FileText className="h-7 w-7 text-violet-600" />
          </div>

          <div className="text-left">
            <h3 className="text-base font-semibold text-slate-900">
              View AI Summary
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Get an AI summary from the top YouTube videos.
            </p>
          </div>

        </div>

        <ArrowRight className="h-5 w-5 text-violet-600 transition-transform duration-300 group-hover:translate-x-1" />
      </button>

      {/* Quiz */}
      <button className="group flex items-center justify-between rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <BadgeHelp className="h-7 w-7 text-emerald-600" />
          </div>

          <div className="text-left">
            <h3 className="text-base font-semibold text-slate-900">
              Generate Quiz
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create MCQs to test your understanding.
            </p>
          </div>

        </div>

        <ArrowRight className="h-5 w-5 text-emerald-600 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
            {/* Generate PPT */}
      <button className="group flex items-center justify-between rounded-2xl border border-blue-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <Presentation className="h-7 w-7 text-blue-600" />
          </div>

          <div className="text-left">
            <h3 className="text-base font-semibold text-slate-900">
              Generate PPT
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create presentation slides instantly.
            </p>
          </div>

        </div>

        <ArrowRight className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:translate-x-1" />
      </button>

      {/* Export PDF */}
      <button className="group flex items-center justify-between rounded-2xl border border-rose-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:shadow-lg">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
            <FileDown className="h-7 w-7 text-rose-600" />
          </div>

          <div className="text-left">
            <h3 className="text-base font-semibold text-slate-900">
              Export PDF
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Download your summary as a PDF.
            </p>
          </div>

        </div>

        <ArrowRight className="h-5 w-5 text-rose-600 transition-transform duration-300 group-hover:translate-x-1" />
      </button>

    </div>
  );
}