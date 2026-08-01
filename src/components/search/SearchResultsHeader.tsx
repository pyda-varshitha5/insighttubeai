"use client";

interface Props {
  query: string;
}

function capitalizeWords(text: string) {
  return text
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

export default function SearchResultsHeader({ query }: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Results for{" "}
        <span className="text-violet-600">
          "{capitalizeWords(query)}"
        </span>
      </h1>

      <p className="mt-2 text-base text-slate-500">
        Top 10 YouTube videos ranked by relevance
      </p>
    </div>
  );
}