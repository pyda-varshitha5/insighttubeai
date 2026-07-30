export function DotGrid({ className = "" }: { className?: string }) {
  const dots = Array.from({ length: 16 });
  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`} aria-hidden>
      {dots.map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#C6B9F5]" />
      ))}
    </div>
  );
}

export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#B49CF7" className={className} aria-hidden>
      <path d="M12 3 13.7 9.3 20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z" />
    </svg>
  );
}