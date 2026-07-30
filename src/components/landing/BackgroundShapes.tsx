export default function BackgroundShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#C9BBFA] opacity-60 blur-3xl" />
      <div className="absolute top-1/3 -right-10 h-56 w-56 rounded-full bg-[#B7A6F7] opacity-40 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-[#DCD2FB] opacity-70 blur-3xl" />
      <div className="absolute bottom-24 left-4 h-3 w-3 rounded-full bg-[#B9AAF2]" />
    </div>
  );
}