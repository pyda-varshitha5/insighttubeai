"use client";

import SearchResultsHeader from "./SearchResultsHeader";
import SearchActionCards from "./SearchActionCards";
import SearchFilter from "./SearchFilter";
import VideoTable from "./VideoTable";

export default function SearchPage() {
  return (
    <div className="space-y-6">

      <SearchResultsHeader />

      <SearchActionCards />

      <SearchFilter />

      <VideoTable />

    </div>
  );
}