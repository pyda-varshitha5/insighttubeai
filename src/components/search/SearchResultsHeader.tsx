export default function SearchResultsHeader() {
  return (
    <div className="space-y-2">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Results for{" "}
        <span className="text-violet-600">
           React Hooks Tutorial 
        </span>
      </h1>

      <p className="text-base text-slate-500">
        Top 10 YouTube videos ranked by relevance
      </p>
    </div>
  );
}