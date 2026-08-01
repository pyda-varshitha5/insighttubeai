export default function LoadingSummary() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
        </div>
        <p className="text-base font-medium text-gray-700">Generating AI Summary...</p>
        <p className="text-sm text-gray-400">This usually takes a few seconds</p>
      </div>

      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-11/12 rounded bg-gray-100" />
              <div className="h-3 w-4/5 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}