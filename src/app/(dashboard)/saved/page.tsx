import SavedHeader from "@/components/saved/SavedHeader";
import SavedFilters from "@/components/saved/SavedFilters";
import SavedList from "@/components/saved/SavedList";
import SavedEmptyBanner from "@/components/saved/SavedEmptyBanner";

export default function SavedPage() {
  return (
    <div className="min-h-screen space-y-6 bg-slate-50 px-6 py-8 sm:px-8">
      <SavedHeader />
      <SavedFilters />
      <SavedList />
      <SavedEmptyBanner />
    </div>
  );
}