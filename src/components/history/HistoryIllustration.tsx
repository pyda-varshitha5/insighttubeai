import { Clock3, Sparkles, Star, Leaf } from "lucide-react";

export default function HistoryIllustration() {
  return (
    <div className="relative mx-auto flex h-[150px] w-[170px] max-w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-violet-100 via-violet-50 to-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Soft radial glow behind the clock */}
      <div className="absolute h-28 w-28 rounded-full bg-violet-300/50 blur-3xl" />
      <div className="absolute h-16 w-16 rounded-full bg-violet-400/30 blur-2xl" />

      {/* Floating sparkles */}
      <Sparkles className="absolute left-3 top-3 h-3.5 w-3.5 text-violet-400" />
      <Star className="absolute right-4 top-5 h-3 w-3 text-violet-300" />
      <Sparkles className="absolute right-3 top-10 h-2.5 w-2.5 text-violet-300" />

      {/* Central clock illustration */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-violet-100">
        <Clock3 className="h-8 w-8 text-[#8B5CF6]" strokeWidth={1.75} />
      </div>

      {/* Decorative "plants" near bottom corners */}
      <div className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-violet-200/70" />
      <Leaf className="absolute bottom-1 left-1.5 h-4 w-4 text-violet-500" />

      <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-violet-200/70" />
      <Leaf className="absolute bottom-1 right-1.5 h-4 w-4 -scale-x-100 text-violet-500" />
    </div>
  );
}