import { Play } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-white">
        <Play size={20} fill="currentColor" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        InsightTube
        <span className="text-violet-500">-AI</span>
      </h1>
    </div>
  );
}