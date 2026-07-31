"use client";

import SearchHero from "@/components/search/SearchHero";
import RecentSearches from "@/components/search/RecentSearches";
import SuggestedSearches from "@/components/search/SuggestedSearches";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <SearchHero />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentSearches />
        </div>
        <div className="lg:col-span-2">
          <SuggestedSearches />
        </div>
      </div>
    </div>
  );
}